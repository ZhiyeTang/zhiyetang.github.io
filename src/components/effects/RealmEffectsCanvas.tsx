import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  getRealmEffectsSnapshot,
  setRealmPointer,
} from './realmEffectsStore'

type Props = {
  onReady: () => void
}

const fullscreenVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const realmFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uHeaven;
  uniform sampler2D uEarth;
  uniform sampler2D uHell;
  uniform vec2 uResolution;
  uniform vec2 uHeavenSize;
  uniform vec2 uEarthSize;
  uniform vec2 uHellSize;
  uniform float uHellAnchorX;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uProgress;
  uniform float uTime;

  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise21(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  vec2 coverUv(vec2 uv, vec2 imageSize) {
    float screenAspect = uResolution.x / max(uResolution.y, 1.0);
    float imageAspect = imageSize.x / max(imageSize.y, 1.0);
    vec2 ratio = vec2(
      min(screenAspect / imageAspect, 1.0),
      min(imageAspect / screenAspect, 1.0)
    );
    return uv * ratio + (1.0 - ratio) * 0.5;
  }

  vec2 coverUvAnchored(vec2 uv, vec2 imageSize, float anchorX) {
    float screenAspect = uResolution.x / max(uResolution.y, 1.0);
    float imageAspect = imageSize.x / max(imageSize.y, 1.0);
    vec2 ratio = vec2(
      min(screenAspect / imageAspect, 1.0),
      min(imageAspect / screenAspect, 1.0)
    );
    vec2 offset = vec2((1.0 - ratio.x) * anchorX, (1.0 - ratio.y) * 0.5);
    return uv * ratio + offset;
  }

  vec3 sampleEarth(vec2 uv, vec2 parallax, float aberration) {
    vec2 baseUv = coverUv(uv, uEarthSize);
    float luminance = dot(texture2D(uEarth, baseUv).rgb, vec3(0.299, 0.587, 0.114));
    float depth = smoothstep(0.04, 0.72, luminance);
    vec2 shifted = baseUv + parallax * mix(0.003, 0.018, depth);
    float r = texture2D(uEarth, shifted + parallax * aberration).r;
    float g = texture2D(uEarth, shifted).g;
    float b = texture2D(uEarth, shifted - parallax * aberration).b;
    return vec3(r, g, b);
  }

  vec3 sampleHell(vec2 uv, vec2 parallax) {
    vec2 baseUv = coverUvAnchored(uv, uHellSize, uHellAnchorX);
    vec2 shifted = baseUv + parallax * 0.32;
    return texture2D(uHell, shifted).rgb;
  }

  void main() {
    vec2 centered = vUv - 0.5;
    vec2 pointer = uPointer * vec2(1.0, -1.0) * uPointerActive;
    vec2 parallax = pointer * 0.018;
    float earthMix = smoothstep(0.18, 0.365, uProgress);
    float hellMix = smoothstep(0.62, 0.79, uProgress);

    vec2 portal = vec2(0.84, 0.78);
    vec2 portalDelta = vUv - portal;
    float portalDistance = length(portalDelta * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0));
    float fieldNoise = noise21(vUv * 5.5 + vec2(uTime * 0.035, -uTime * 0.026));
    float threshold = portalDistance * 0.78 + (fieldNoise - 0.5) * 0.105;
    float revealPhase = earthMix * 1.48;
    float reveal = smoothstep(0.0, 0.09, revealPhase - threshold);
    float transitionWindow = smoothstep(0.025, 0.16, earthMix) * (1.0 - smoothstep(0.82, 1.0, earthMix));
    float edge = 1.0 - smoothstep(0.0, 0.075, abs(revealPhase - threshold));
    edge *= transitionWindow;
    reveal *= smoothstep(0.015, 0.12, earthMix);

    vec2 portalDirection = normalize(portalDelta + vec2(0.0001));
    vec2 heavenUv = coverUv(vUv - portalDirection * edge * 0.026, uHeavenSize);
    heavenUv += parallax * 0.25;

    vec3 heaven = texture2D(uHeaven, heavenUv).rgb;
    vec3 earth = sampleEarth(vUv + portalDirection * edge * 0.016, parallax, edge * 0.55);
    earth = pow(max(earth, vec3(0.0)), vec3(0.82)) * 1.12;
    vec3 color = mix(heaven, earth, reveal);

    vec3 spectral = vec3(
      sampleEarth(vUv + portalDirection * edge * 0.009, parallax, 1.7).r,
      color.g,
      texture2D(uHeaven, coverUv(vUv - portalDirection * edge * 0.012, uHeavenSize)).b
    );
    color = mix(color, spectral, edge * 0.42);

    float transitionGlow = edge * (0.08 + 0.16 * (1.0 - portalDistance));
    color += vec3(0.96, 0.77, 0.48) * max(transitionGlow, 0.0);

    vec2 hellPortal = vec2(0.84, 0.78);
    vec2 hellPortalDelta = vUv - hellPortal;
    float hellPortalDistance = length(hellPortalDelta * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0));
    float hellNoise = noise21(vUv * 5.8 + vec2(-uTime * 0.031, uTime * 0.023));
    float hellThreshold = hellPortalDistance * 0.78 + (hellNoise - 0.5) * 0.105;
    float hellRevealPhase = hellMix * 1.48;
    float hellReveal = smoothstep(0.0, 0.09, hellRevealPhase - hellThreshold);
    float hellTransitionWindow = smoothstep(0.025, 0.16, hellMix) * (1.0 - smoothstep(0.82, 1.0, hellMix));
    float hellEdge = 1.0 - smoothstep(0.0, 0.075, abs(hellRevealPhase - hellThreshold));
    hellEdge *= hellTransitionWindow;
    hellReveal *= smoothstep(0.015, 0.12, hellMix);

    vec2 hellPortalDirection = normalize(hellPortalDelta + vec2(0.0001));
    vec3 hell = sampleHell(vUv + hellPortalDirection * hellEdge * 0.016, parallax);
    vec3 hellSpectral = vec3(
      sampleHell(vUv + hellPortalDirection * hellEdge * 0.009, parallax).r,
      color.g,
      sampleHell(vUv - hellPortalDirection * hellEdge * 0.012, parallax).b
    );
    hell = mix(hell, hellSpectral, hellEdge * 0.38);
    color = mix(color, hell, hellReveal);

    float hellTransitionGlow = hellEdge * (0.07 + 0.15 * (1.0 - hellPortalDistance));
    color += vec3(0.92, 0.29, 0.09) * max(hellTransitionGlow, 0.0);

    float vignette = 1.0 - smoothstep(0.46, 0.86, length(centered * vec2(0.86, 1.0)));
    color *= mix(0.8, 1.0, vignette);
    float grain = hash21(gl_FragCoord.xy + fract(uTime) * 71.0) - 0.5;
    color += grain * 0.018;

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

const heavenLightFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uProgress;
  uniform float uTime;
  uniform float uIntent;
  uniform vec2 uBeamSources[4];
  uniform vec2 uBeamTargets[4];
  uniform float uBeamSourceWidths[4];
  uniform float uBeamTargetWidths[4];

  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.31));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise21(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float beamPointerScore(vec2 source, vec2 target, float sourceWidth, float targetWidth) {
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 scaledSource = source * aspect;
    vec2 scaledTarget = target * aspect;
    vec2 axis = scaledTarget - scaledSource;
    float beamLength = max(length(axis), 0.0001);
    vec2 direction = axis / beamLength;
    vec2 pointerUv = uPointer * 0.5 + 0.5;
    vec2 pointerRelative = pointerUv * aspect - scaledSource;
    float pointerProgress = dot(pointerRelative, direction) / beamLength;
    float pointerLateral = abs(pointerRelative.x * direction.y - pointerRelative.y * direction.x);
    float pointerSpread = mix(sourceWidth, targetWidth, pow(clamp(pointerProgress, 0.0, 1.0), 0.84));
    float alongGate = smoothstep(0.025, 0.1, pointerProgress) * (1.0 - smoothstep(0.78, 1.02, pointerProgress));
    float proximity = 1.0 - smoothstep(pointerSpread * 0.5, pointerSpread * 1.85, pointerLateral);
    return proximity * alongGate * uPointerActive;
  }

  float beam(vec2 uv, vec2 source, vec2 target, float sourceWidth, float targetWidth, float pointerFocus) {
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 scaledSource = source * aspect;
    vec2 scaledTarget = target * aspect;
    vec2 relative = uv * aspect - scaledSource;
    vec2 axis = scaledTarget - scaledSource;
    float beamLength = max(length(axis), 0.0001);
    vec2 direction = axis / beamLength;
    float along = dot(relative, direction);
    float beamProgress = along / beamLength;
    float lateral = abs(relative.x * direction.y - relative.y * direction.x);
    float spread = mix(sourceWidth, targetWidth, pow(clamp(beamProgress, 0.0, 1.0), 0.84));
    vec2 pointerUv = uPointer * 0.5 + 0.5;
    float pointerProgress = dot(pointerUv * aspect - scaledSource, direction) / beamLength;
    float focusWindow = 1.0 - smoothstep(0.055, 0.235, abs(beamProgress - pointerProgress));
    float localFocus = pointerFocus * focusWindow;
    float focusedSpread = spread * mix(1.0, 0.66, localFocus);
    float body = 1.0 - smoothstep(focusedSpread * 0.32, focusedSpread, lateral);
    float core = 1.0 - smoothstep(focusedSpread * 0.08, focusedSpread * 0.44, lateral);
    float sourceGate = smoothstep(0.015, 0.09, beamProgress);
    float targetGate = 1.0 - smoothstep(0.74, 1.0, beamProgress);
    return (body + core * localFocus * 0.42) * sourceGate * targetGate * step(0.0, beamProgress);
  }

  void main() {
    float heavenPresence = 1.0 - smoothstep(0.23, 0.42, uProgress);
    float shimmer = 0.84 + 0.16 * sin(uTime * 0.58 + vUv.y * 17.0);
    float pointerScores[4];
    pointerScores[0] = beamPointerScore(uBeamSources[0], uBeamTargets[0], uBeamSourceWidths[0], uBeamTargetWidths[0]);
    pointerScores[1] = beamPointerScore(uBeamSources[1], uBeamTargets[1], uBeamSourceWidths[1], uBeamTargetWidths[1]);
    pointerScores[2] = beamPointerScore(uBeamSources[2], uBeamTargets[2], uBeamSourceWidths[2], uBeamTargetWidths[2]);
    pointerScores[3] = beamPointerScore(uBeamSources[3], uBeamTargets[3], uBeamSourceWidths[3], uBeamTargetWidths[3]);
    float strongestPointerScore = max(max(pointerScores[0], pointerScores[1]), max(pointerScores[2], pointerScores[3]));
    float pointerFocus0 = smoothstep(0.08, 0.72, pointerScores[0]) * step(strongestPointerScore - 0.001, pointerScores[0]);
    float pointerFocus1 = smoothstep(0.08, 0.72, pointerScores[1]) * step(strongestPointerScore - 0.001, pointerScores[1]);
    float pointerFocus2 = smoothstep(0.08, 0.72, pointerScores[2]) * step(strongestPointerScore - 0.001, pointerScores[2]);
    float pointerFocus3 = smoothstep(0.08, 0.72, pointerScores[3]) * step(strongestPointerScore - 0.001, pointerScores[3]);
    float shafts = 0.0;
    shafts += beam(vUv, uBeamSources[0], uBeamTargets[0], uBeamSourceWidths[0], uBeamTargetWidths[0], pointerFocus0) * mix(0.86, 1.48, step(0.5, 1.0 - abs(uIntent - 0.0)));
    shafts += beam(vUv, uBeamSources[1], uBeamTargets[1], uBeamSourceWidths[1], uBeamTargetWidths[1], pointerFocus1) * mix(0.82, 1.44, step(0.5, 1.0 - abs(uIntent - 1.0)));
    shafts += beam(vUv, uBeamSources[2], uBeamTargets[2], uBeamSourceWidths[2], uBeamTargetWidths[2], pointerFocus2) * mix(0.78, 1.4, step(0.5, 1.0 - abs(uIntent - 2.0)));
    shafts += beam(vUv, uBeamSources[3], uBeamTargets[3], uBeamSourceWidths[3], uBeamTargetWidths[3], pointerFocus3) * mix(0.74, 1.36, step(0.5, 1.0 - abs(uIntent - 3.0)));

    float caustic = noise21(vUv * 15.0 + vec2(uTime * 0.035, -uTime * 0.026));
    float pointerDistance = length(vUv - (uPointer * 0.5 + 0.5));
    float pointerWake = (1.0 - smoothstep(0.025, 0.16, pointerDistance)) * uPointerActive;
    float intensity = shafts * shimmer * (0.125 + caustic * 0.055 + pointerWake * 0.13);
    vec3 lightColor = mix(vec3(1.0, 0.72, 0.36), vec3(1.0, 0.95, 0.78), clamp(shafts, 0.0, 1.0));
    gl_FragColor = vec4(lightColor * intensity, intensity * heavenPresence * 0.5);
  }
`

const particleVertexShader = /* glsl */ `
  precision highp float;

  attribute float aSeed;
  attribute float aDepth;
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uCredoStrength;
  uniform float uCredoTargetCount;
  uniform vec2 uCredoTargets[48];
  varying float vAlpha;
  varying float vGather;
  varying float vRealm;
  varying float vHell;

  void main() {
    vec2 point = position.xy;
    float earth = smoothstep(0.22, 0.44, uProgress);
    float hell = smoothstep(0.66, 0.84, uProgress);
    float heavenTransition = 1.0 - smoothstep(0.0, 0.15, abs(uProgress - 0.285));
    float hellTransition = 1.0 - smoothstep(0.0, 0.15, abs(uProgress - 0.715));
    float transition = max(heavenTransition, hellTransition);
    float headingSeed = fract(sin(aSeed * 127.1 + aDepth * 311.7) * 43758.5453);
    float speedSeed = fract(sin(aSeed * 269.5 + aDepth * 183.3) * 24634.6345);
    float heading = headingSeed * 6.2831853;
    float speed = mix(0.012, 0.045, speedSeed) * mix(0.72, 1.12, aDepth);
    vec2 direction = vec2(cos(heading), sin(heading));
    vec2 wander = vec2(
      sin(uTime * mix(0.18, 0.34, speedSeed) + aSeed * 41.0),
      cos(uTime * mix(0.15, 0.29, speedSeed) + aSeed * 29.0)
    ) * mix(0.012, 0.038, aDepth);
    point += direction * uTime * speed + wander;
    point = mod(point + 1.0, 2.0) - 1.0;

    vec2 emberWander = vec2(
      sin(uTime * mix(0.16, 0.28, speedSeed) + aSeed * 19.0),
      cos(uTime * mix(0.13, 0.24, speedSeed) + aSeed * 23.0)
    ) * mix(0.008, 0.024, aDepth) * hell;
    point += emberWander;
    point = mod(point + 1.0, 2.0) - 1.0;

    vec2 portal = vec2(0.68, 0.56);
    point = mix(point, portal + (point - portal) * 0.18, transition * (0.18 + aDepth * 0.36));

    vec2 credoTarget = point;
    float credoDistance = 10.0;
    for (int index = 0; index < 48; index++) {
      float enabled = 1.0 - step(uCredoTargetCount, float(index));
      vec2 targetDelta = uCredoTargets[index] - point;
      float targetDistance = length(targetDelta * vec2(uAspect, 1.0));
      float nearer = enabled * step(targetDistance, credoDistance);
      credoTarget = mix(credoTarget, uCredoTargets[index], nearer);
      credoDistance = mix(credoDistance, targetDistance, nearer);
    }
    float nearby = 1.0 - smoothstep(0.08, 0.24, credoDistance);
    float gatherSeed = fract(sin(aSeed * 157.31 + aDepth * 73.17) * 24634.6345);
    float volunteer = smoothstep(0.25, 0.62, gatherSeed);
    float gather = uCredoStrength * nearby * volunteer;
    vec2 sacredDrift = vec2(
      sin(uTime * 0.54 + aSeed * 83.0),
      cos(uTime * 0.47 + aSeed * 67.0)
    ) * vec2(0.006, 0.009);
    point = mix(point, credoTarget + sacredDrift, gather * (0.72 + aDepth * 0.12));

    vec2 pointerDelta = point - uPointer;
    float pointerDistance = max(length(pointerDelta), 0.04);
    point += normalize(pointerDelta) * (1.0 - smoothstep(0.04, 0.34, pointerDistance)) * mix(0.03, 0.042, hell) * uPointerActive * aDepth;

    gl_Position = vec4(point, 0.0, 1.0);
    gl_PointSize = uPixelRatio * mix(1.2, 3.8, aDepth) * (1.0 + transition * 0.8 + gather * 0.18 + hell * 0.12);
    vAlpha = mix(0.18, 0.72, aDepth) * (1.0 + gather * 0.38) * mix(1.0, 0.9, hell);
    vGather = gather;
    vRealm = earth;
    vHell = hell;
  }
`

const particleFragmentShader = /* glsl */ `
  precision highp float;

  varying float vAlpha;
  varying float vGather;
  varying float vRealm;
  varying float vHell;

  void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float radius = length(centered);
    float alpha = (1.0 - smoothstep(0.05, 0.5, radius)) * vAlpha;
    vec3 heaven = vec3(1.0, 0.82, 0.52);
    vec3 earth = vec3(0.38, 0.78, 0.9);
    vec3 hell = vec3(1.0, 0.42, 0.16);
    vec3 color = mix(heaven, earth, vRealm);
    color = mix(color, hell, vHell);
    color = mix(color, vec3(1.0, 0.95, 0.78), vGather * 0.62);
    gl_FragColor = vec4(color * (1.0 + alpha * 0.5), alpha);
  }
`

const smooth = (current: number, target: number, speed: number, delta: number) => (
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta))
)

const readCredoParticleTargets = (limit = 48) => {
  const paragraph = document.querySelector<HTMLElement>('.credo-inscription p')
  const textNode = paragraph?.firstChild
  if (!paragraph || !(textNode instanceof Text)) return []

  const range = document.createRange()
  const targets = Array.from(textNode.textContent ?? '').flatMap((character, index) => {
    if (/\s/.test(character)) return []
    range.setStart(textNode, index)
    range.setEnd(textNode, index + 1)
    const rect = range.getBoundingClientRect()
    if (!rect.width || !rect.height) return []
    const edge = index % 4
    const edgeGap = Math.min(2, rect.height * 0.1)
    const x = edge === 1
      ? rect.right + edgeGap
      : edge === 3
        ? rect.left - edgeGap
        : rect.left + rect.width * 0.5
    const y = edge === 0
      ? rect.top - edgeGap
      : edge === 2
        ? rect.bottom + edgeGap
        : rect.top + rect.height * 0.5
    return [new THREE.Vector2(
      x / Math.max(window.innerWidth, 1) * 2 - 1,
      -(y / Math.max(window.innerHeight, 1) * 2 - 1),
    )]
  }).slice(0, limit)
  range.detach()
  return targets
}

function RealmBackground({ mobile, onReady }: { mobile: boolean; onReady: () => void }) {
  const urls = useMemo(() => (
    mobile
      ? ['/images/heaven-church-mobile-v4.webp', '/images/earth-library-room-integrated-mobile-v2.webp', '/images/hell-listening-bar-v1.webp']
      : ['/images/heaven-church-v4.webp', '/images/earth-library-room-integrated-v3.webp', '/images/hell-listening-bar-v1.webp']
  ), [mobile])
  const textures = useLoader(THREE.TextureLoader, urls)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const lightMaterialRef = useRef<THREE.ShaderMaterial>(null)
  const { size, gl } = useThree()

  const uniforms = useMemo(() => ({
    uHeaven: { value: textures[0] },
    uEarth: { value: textures[1] },
    uHell: { value: textures[2] },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uHeavenSize: { value: new THREE.Vector2(1, 1) },
    uEarthSize: { value: new THREE.Vector2(1, 1) },
    uHellSize: { value: new THREE.Vector2(1, 1) },
    uHellAnchorX: { value: mobile ? 0.2 : 0.5 },
    uPointer: { value: new THREE.Vector2() },
    uPointerActive: { value: 0 },
    uProgress: { value: 0.5 },
    uTime: { value: 0 },
  }), [mobile, textures])

  const lightUniforms = useMemo(() => ({
    uResolution: { value: new THREE.Vector2(1, 1) },
    uPointer: { value: new THREE.Vector2() },
    uPointerActive: { value: 0 },
    uProgress: { value: 0.5 },
    uTime: { value: 0 },
    uIntent: { value: -1 },
    uBeamSources: { value: Array.from({ length: 4 }, () => new THREE.Vector2(0.86, 0.58)) },
    uBeamTargets: { value: Array.from({ length: 4 }, () => new THREE.Vector2(0.56, 0.2)) },
    uBeamSourceWidths: { value: [0.008, 0.008, 0.008, 0.008] },
    uBeamTargetWidths: { value: [0.065, 0.065, 0.065, 0.065] },
  }), [])

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = false
      texture.needsUpdate = true
    })

    const heavenImage = textures[0].image as { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
    const earthImage = textures[1].image as { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
    const hellImage = textures[2].image as { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
    uniforms.uHeavenSize.value.set(heavenImage.naturalWidth ?? heavenImage.width ?? 1, heavenImage.naturalHeight ?? heavenImage.height ?? 1)
    uniforms.uEarthSize.value.set(earthImage.naturalWidth ?? earthImage.width ?? 1, earthImage.naturalHeight ?? earthImage.height ?? 1)
    uniforms.uHellSize.value.set(hellImage.naturalWidth ?? hellImage.width ?? 1, hellImage.naturalHeight ?? hellImage.height ?? 1)
    gl.domElement.dataset.realmEffects = 'ready'
    gl.domElement.dataset.realmTextureMode = mobile ? 'mobile' : 'desktop'
    gl.domElement.dataset.heavenTexture = textures[0].image?.src ?? urls[0]
    gl.domElement.dataset.earthTexture = textures[1].image?.src ?? urls[1]
    gl.domElement.dataset.hellTexture = textures[2].image?.src ?? urls[2]
    gl.domElement.dataset.heavenTextureSize = `${uniforms.uHeavenSize.value.x}x${uniforms.uHeavenSize.value.y}`
    gl.domElement.dataset.earthTextureSize = `${uniforms.uEarthSize.value.x}x${uniforms.uEarthSize.value.y}`
    gl.domElement.dataset.hellTextureSize = `${uniforms.uHellSize.value.x}x${uniforms.uHellSize.value.y}`
    gl.domElement.dataset.hellTextureAnchor = uniforms.uHellAnchorX.value.toFixed(2)
    onReady()
  }, [gl, mobile, onReady, textures, uniforms, urls])

  useFrame((state, delta) => {
    const material = materialRef.current
    const lightMaterial = lightMaterialRef.current
    if (!material || !lightMaterial) return
    const snapshot = getRealmEffectsSnapshot()
    const elapsed = state.clock.getElapsedTime()

    gl.domElement.dataset.realmProgress = snapshot.progress.toFixed(3)
    gl.domElement.dataset.realmRenderedProgress = material.uniforms.uProgress.value.toFixed(3)

    material.uniforms.uResolution.value.set(size.width * state.viewport.dpr, size.height * state.viewport.dpr)
    material.uniforms.uProgress.value = smooth(material.uniforms.uProgress.value, snapshot.progress, 8.5, delta)
    material.uniforms.uPointer.value.x = smooth(material.uniforms.uPointer.value.x, snapshot.pointerX, 5.5, delta)
    material.uniforms.uPointer.value.y = smooth(material.uniforms.uPointer.value.y, snapshot.pointerY, 5.5, delta)
    material.uniforms.uPointerActive.value = smooth(material.uniforms.uPointerActive.value, snapshot.pointerActive, 5.0, delta)
    material.uniforms.uTime.value = elapsed

    lightMaterial.uniforms.uResolution.value.copy(material.uniforms.uResolution.value)
    lightMaterial.uniforms.uProgress.value = material.uniforms.uProgress.value
    lightMaterial.uniforms.uPointer.value.copy(material.uniforms.uPointer.value)
    lightMaterial.uniforms.uPointerActive.value = material.uniforms.uPointerActive.value
    lightMaterial.uniforms.uTime.value = elapsed
    const intent = snapshot.heavenActive >= 0 ? snapshot.heavenActive : snapshot.heavenHovered
    lightMaterial.uniforms.uIntent.value = smooth(lightMaterial.uniforms.uIntent.value, intent, 7.0, delta)
    if (snapshot.heavenBeams.length === 4) {
      snapshot.heavenBeams.forEach((beam, index) => {
        lightMaterial.uniforms.uBeamSources.value[index].set(beam.sourceX, beam.sourceY)
        lightMaterial.uniforms.uBeamTargets.value[index].set(beam.targetX, beam.targetY)
        lightMaterial.uniforms.uBeamSourceWidths.value[index] = beam.sourceWidth
        lightMaterial.uniforms.uBeamTargetWidths.value[index] = beam.targetWidth
      })
      gl.domElement.dataset.heavenBeamSources = snapshot.heavenBeams
        .map((beam) => `${beam.sourceX.toFixed(3)},${beam.sourceY.toFixed(3)}`)
        .join('|')
      gl.domElement.dataset.heavenBeamTargets = snapshot.heavenBeams
        .map((beam) => `${beam.targetX.toFixed(3)},${beam.targetY.toFixed(3)}`)
        .join('|')
    }
  })

  return (
    <>
      <mesh frustumCulled={false} renderOrder={0}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={fullscreenVertexShader}
          fragmentShader={realmFragmentShader}
          depthTest={false}
          depthWrite={false}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh frustumCulled={false} renderOrder={2}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={lightMaterialRef}
          uniforms={lightUniforms}
          vertexShader={fullscreenVertexShader}
          fragmentShader={heavenLightFragmentShader}
          depthTest={false}
          depthWrite={false}
          transparent
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </>
  )
}

function RealmParticles({ mobile }: { mobile: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const targetLayoutRef = useRef({ credo: -1, width: 0, height: 0 })
  const count = mobile ? 170 : 420
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const depths = new Float32Array(count)
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = Math.random() * 2 - 1
      positions[index * 3 + 1] = Math.random() * 2 - 1
      positions[index * 3 + 2] = 0
      seeds[index] = Math.random()
      depths[index] = 0.25 + Math.random() * 0.75
    }
    const nextGeometry = new THREE.BufferGeometry()
    nextGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    nextGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    nextGeometry.setAttribute('aDepth', new THREE.BufferAttribute(depths, 1))
    return nextGeometry
  }, [count])

  const uniforms = useMemo(() => ({
    uProgress: { value: 0.5 },
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uAspect: { value: 1 },
    uPointer: { value: new THREE.Vector2() },
    uPointerActive: { value: 0 },
    uCredoStrength: { value: 0 },
    uCredoTargetCount: { value: 0 },
    uCredoTargets: { value: Array.from({ length: 48 }, () => new THREE.Vector2(0, 0)) },
  }), [])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state, delta) => {
    const material = materialRef.current
    if (!material) return
    const snapshot = getRealmEffectsSnapshot()
    material.uniforms.uProgress.value = smooth(material.uniforms.uProgress.value, snapshot.progress, 8.5, delta)
    material.uniforms.uTime.value = state.clock.getElapsedTime()
    material.uniforms.uPixelRatio.value = Math.min(state.viewport.dpr, mobile ? 1.25 : 1.5)
    material.uniforms.uAspect.value = state.size.width / Math.max(state.size.height, 1)
    material.uniforms.uPointer.value.x = smooth(material.uniforms.uPointer.value.x, snapshot.pointerX, 6.0, delta)
    material.uniforms.uPointer.value.y = smooth(material.uniforms.uPointer.value.y, snapshot.pointerY, 6.0, delta)
    material.uniforms.uPointerActive.value = smooth(material.uniforms.uPointerActive.value, snapshot.pointerActive, 5.0, delta)
    const activeCredo = snapshot.heavenVisible > 0.5 ? snapshot.heavenActive : -1
    const layout = targetLayoutRef.current
    if (layout.credo !== activeCredo || layout.width !== state.size.width || layout.height !== state.size.height) {
      const targets = activeCredo >= 0 ? readCredoParticleTargets() : []
      material.uniforms.uCredoTargetCount.value = targets.length
      material.uniforms.uCredoTargets.value.forEach((target: THREE.Vector2, index: number) => {
        target.copy(targets[index] ?? targets[0] ?? new THREE.Vector2(0, 0))
      })
      layout.credo = activeCredo
      layout.width = state.size.width
      layout.height = state.size.height
    }
    const credoTargetStrength = activeCredo >= 0 && material.uniforms.uCredoTargetCount.value > 0 ? 1 : 0
    material.uniforms.uCredoStrength.value = smooth(
      material.uniforms.uCredoStrength.value,
      credoTargetStrength,
      credoTargetStrength ? 2.8 : 1.7,
      delta,
    )
    state.gl.domElement.dataset.credoParticleStrength = material.uniforms.uCredoStrength.value.toFixed(3)
    state.gl.domElement.dataset.credoParticleTargets = String(material.uniforms.uCredoTargetCount.value)
    state.gl.domElement.dataset.particleFlow = 'free'
    state.gl.domElement.dataset.particleBackend = 'webgl'
    state.gl.domElement.dataset.particlePointerActive = material.uniforms.uPointerActive.value.toFixed(3)
    state.gl.domElement.dataset.particlePointer = `${material.uniforms.uPointer.value.x.toFixed(3)},${material.uniforms.uPointer.value.y.toFixed(3)}`
    state.gl.domElement.dataset.particleRealm = material.uniforms.uProgress.value < 0.3
      ? 'heaven'
      : material.uniforms.uProgress.value < 0.7
        ? 'earth'
        : 'hell'
    state.gl.domElement.dataset.credoParticleMode = 'local-edge-attraction'
  })

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={3}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        depthTest={false}
        depthWrite={false}
        transparent
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

function EffectsScene({ mobile, onReady }: { mobile: boolean; onReady: () => void }) {
  return (
    <>
      <RealmBackground mobile={mobile} onReady={onReady} />
      <RealmParticles mobile={mobile} />
    </>
  )
}

export default function RealmEffectsCanvas({ onReady }: Props) {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 820px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 820px)')
    const update = () => setMobile(query.matches)
    query.addEventListener('change', update)

    const onPointerMove = (event: PointerEvent) => {
      setRealmPointer(
        event.clientX / Math.max(window.innerWidth, 1) * 2 - 1,
        -(event.clientY / Math.max(window.innerHeight, 1) * 2 - 1),
        true,
      )
    }
    const onPointerLeave = () => setRealmPointer(0, 0, false)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onPointerLeave)

    return () => {
      query.removeEventListener('change', update)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('mouseleave', onPointerLeave)
      setRealmPointer(0, 0, false)
    }
  }, [])

  return (
    <div className="realm-effects-canvas" aria-hidden="true">
      <Canvas
        dpr={mobile ? [1, 1.25] : [1, 1.5]}
        frameloop="always"
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x090806, 0)
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.toneMapping = THREE.NoToneMapping
        }}
      >
        <EffectsScene mobile={mobile} onReady={onReady} />
      </Canvas>
    </div>
  )
}
