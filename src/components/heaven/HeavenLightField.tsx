import { useEffect, useRef } from 'react'
import { setHeavenBeamGeometry, setHeavenLightIntent } from '../effects/realmEffectsStore'

type Props = {
  isActive: boolean
  hoveredCredo: number | null
  activeCredo: number | null
}

type Beam = {
  sourceX: number
  sourceY: number
  sourceWidth: number
  targetX: number
  targetY: number
  targetWidth: number
}

type Dust = {
  beam: number
  progress: number
  lateral: number
  depth: number
  speed: number
  radius: number
  alpha: number
  phase: number
  glint: number
  stretch: number
  offsetX: number
  offsetY: number
  velocityX: number
  velocityY: number
  focus: number
  gatherAffinity: number
  targetSeed: number
  targetJitterX: number
  targetJitterY: number
}

type GlyphTarget = {
  left: number
  top: number
  width: number
  height: number
}

type PointerState = {
  x: number
  y: number
  targetX: number
  targetY: number
  previousX: number
  previousY: number
  velocityX: number
  velocityY: number
  active: boolean
  beam: number
  energy: number
}

const colors = [
  [255, 235, 198],
  [253, 221, 165],
  [246, 205, 146],
  [244, 218, 180],
] as const

function beamCoordinates(beam: Beam, progress: number, lateral: number) {
  const axisX = beam.targetX - beam.sourceX
  const axisY = beam.targetY - beam.sourceY
  const length = Math.max(1, Math.hypot(axisX, axisY))
  const normalX = -axisY / length
  const normalY = axisX / length
  const halfWidth = beam.sourceWidth + (beam.targetWidth - beam.sourceWidth) * progress
  return {
    x: beam.sourceX + axisX * progress + normalX * lateral * halfWidth,
    y: beam.sourceY + axisY * progress + normalY * lateral * halfWidth,
    normalX,
    normalY,
    halfWidth,
  }
}

function isInsideBeam(beam: Beam, x: number, y: number) {
  const axisX = beam.targetX - beam.sourceX
  const axisY = beam.targetY - beam.sourceY
  const lengthSquared = axisX * axisX + axisY * axisY
  if (lengthSquared === 0) return false
  const relativeX = x - beam.sourceX
  const relativeY = y - beam.sourceY
  const progress = (relativeX * axisX + relativeY * axisY) / lengthSquared
  if (progress < 0 || progress > 1) return false
  const axisLength = Math.sqrt(lengthSquared)
  const perpendicular = Math.abs(relativeX * -axisY / axisLength + relativeY * axisX / axisLength)
  const halfWidth = beam.sourceWidth + (beam.targetWidth - beam.sourceWidth) * progress
  return perpendicular <= halfWidth
}

export default function HeavenLightField({ isActive, hoveredCredo, activeCredo }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({ isActive, hoveredCredo, activeCredo, activeSince: activeCredo === null ? 0 : performance.now() })
  const wakeRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    const previous = stateRef.current
    const changed = previous.activeCredo !== activeCredo
    stateRef.current = {
      isActive,
      hoveredCredo,
      activeCredo,
      activeSince: activeCredo === null ? 0 : changed ? performance.now() : previous.activeSince,
    }
    wakeRef.current()
    setHeavenLightIntent({ active: activeCredo, hovered: hoveredCredo, visible: isActive })
  }, [isActive, hoveredCredo, activeCredo])

  useEffect(() => () => {
    setHeavenLightIntent({ active: null, hovered: null, visible: false })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer: PointerState = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      previousX: -1000,
      previousY: -1000,
      velocityX: 0,
      velocityY: 0,
      active: false,
      beam: -1,
      energy: 0,
    }
    let width = window.innerWidth
    let height = window.innerHeight
    let beams: Beam[] = []
    let particles: Dust[] = []
    let glyphTargets: GlyphTarget[] = []
    let beamEnergy = [0, 0, 0, 0]
    let animationFrame = 0
    let pageVisible = !document.hidden
    let lastFrame = 0
    let lastProjectedCredo: number | null = null

    const readBeams = () => {
      const panes = Array.from(document.querySelectorAll<HTMLElement>('.journey-heaven [data-credo-window]'))
      const mediaRect = document.querySelector<HTMLElement>('.heaven-media-coordinates')?.getBoundingClientRect()
      const mobile = width <= 820
      beams = panes.map((pane) => {
        const rect = pane.getBoundingClientRect()
        const sourceX = rect.left + rect.width * 0.5
        const sourceY = rect.top + rect.height * 0.34
        const targetY = mediaRect
          ? mediaRect.top + mediaRect.height * (mobile ? 0.68 : 0.74)
          : height * (mobile ? 0.68 : 0.74)
        const targetX = sourceX - (targetY - sourceY) * (mobile ? 0.48 : 1.12)
        return {
          sourceX,
          sourceY,
          sourceWidth: Math.max(7, rect.width * 0.48),
          targetX,
          targetY,
          targetWidth: width * (mobile ? 0.055 : 0.065),
        }
      })
      setHeavenBeamGeometry(beams.map((beam) => ({
        sourceX: beam.sourceX / Math.max(width, 1),
        sourceY: 1 - beam.sourceY / Math.max(height, 1),
        targetX: beam.targetX / Math.max(width, 1),
        targetY: 1 - beam.targetY / Math.max(height, 1),
        sourceWidth: beam.sourceWidth / Math.max(height, 1) * 0.7,
        targetWidth: beam.targetWidth / Math.max(height, 1) * 0.62,
      })))
    }

    const makeParticle = (beam: number): Dust => {
      const depth = Math.random()
      return {
        beam,
        progress: Math.random(),
        // A triangular distribution keeps most dust near the optical axis
        // without exposing the polygon that constrains the particles.
        lateral: ((Math.random() + Math.random() + Math.random()) / 3) * 2 - 1,
        depth,
        speed: 0.000018 + Math.random() * 0.000048,
        radius: 0.26 + depth * 1.32 + Math.random() * 0.42,
        alpha: 0.065 + depth * 0.205 + Math.random() * 0.075,
        phase: Math.random() * Math.PI * 2,
        glint: Math.random(),
        stretch: 0.82 + Math.random() * 0.5,
        offsetX: 0,
        offsetY: 0,
        velocityX: 0,
        velocityY: 0,
        focus: 0,
        gatherAffinity: Math.random(),
        targetSeed: Math.random(),
        targetJitterX: Math.random() * 2 - 1,
        targetJitterY: Math.random() * 2 - 1,
      }
    }

    const readGlyphTargets = () => {
      const paragraph = document.querySelector<HTMLElement>('.credo-inscription p')
      const textNode = paragraph?.firstChild
      if (!paragraph || !(textNode instanceof Text)) {
        glyphTargets = []
        return
      }
      const text = textNode.textContent ?? ''
      const range = document.createRange()
      glyphTargets = Array.from(text).flatMap((character, index) => {
        if (/\s/.test(character)) return []
        range.setStart(textNode, index)
        range.setEnd(textNode, index + 1)
        const rect = range.getBoundingClientRect()
        if (!rect.width || !rect.height) return []
        return [{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }]
      })
      range.detach()
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      readBeams()
      readGlyphTargets()
      const count = reducedMotion ? 24 : width < 760 ? 156 : Math.min(560, Math.round(width * 0.34))
      particles = Array.from({ length: count }, (_, index) => makeParticle(index % 4))
    }

    const updatePointer = () => {
      const smoothing = reducedMotion ? 1 : 0.115
      pointer.previousX = pointer.x
      pointer.previousY = pointer.y
      pointer.x += (pointer.targetX - pointer.x) * smoothing
      pointer.y += (pointer.targetY - pointer.y) * smoothing
      const nextVelocityX = pointer.x - pointer.previousX
      const nextVelocityY = pointer.y - pointer.previousY
      pointer.velocityX = pointer.velocityX * 0.82 + nextVelocityX * 0.18
      pointer.velocityY = pointer.velocityY * 0.82 + nextVelocityY * 0.18
      pointer.beam = pointer.active ? beams.findIndex((beam) => isInsideBeam(beam, pointer.x, pointer.y)) : -1
      const targetEnergy = pointer.beam >= 0 && !reducedMotion ? 1 : 0
      pointer.energy += (targetEnergy - pointer.energy) * (targetEnergy ? 0.08 : 0.035)
    }

    const render = (time: number) => {
      animationFrame = 0
      if (!pageVisible) return
      const state = stateRef.current
      if (!state.isActive) {
        context.clearRect(0, 0, width, height)
        return
      }
      if (reducedMotion && time - lastFrame < 90) {
        animationFrame = requestAnimationFrame(render)
        return
      }
      const delta = Math.min(40, Math.max(0, time - lastFrame || 16.67))
      lastFrame = time
      if (lastProjectedCredo !== state.activeCredo) {
        lastProjectedCredo = state.activeCredo
        readGlyphTargets()
      }
      updatePointer()
      canvas.dataset.activeBeam = String(pointer.beam)
      canvas.dataset.scatterEnergy = pointer.energy.toFixed(3)
      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = 'screen'

      const projectionElapsed = state.activeCredo === null ? 0 : Math.max(0, time - state.activeSince)
      const projectionAttack = reducedMotion ? .08 : Math.min(1, projectionElapsed / 920)
      const projectionRelease = reducedMotion || projectionElapsed < 1650
        ? 1
        : Math.max(.18, 1 - (projectionElapsed - 1650) / 2350)
      const projectionEnergy = state.activeCredo === null ? 0 : projectionAttack * projectionRelease
      canvas.dataset.projectionEnergy = projectionEnergy.toFixed(3)
      canvas.dataset.projectionTargets = String(glyphTargets.length)

      beams.forEach((beam, index) => {
        const semanticEnergy = state.activeCredo === index ? 1 : state.hoveredCredo === index ? 0.55 : 0
        const pointerEnergy = pointer.beam === index ? pointer.energy : 0
        beamEnergy[index] += (Math.max(semanticEnergy, pointerEnergy) - beamEnergy[index]) * 0.055
      })

      particles.forEach((particle) => {
        const beam = beams[particle.beam]
        if (!beam) return
        if (!reducedMotion) {
          const activeFlow = state.activeCredo === particle.beam ? 1 + projectionEnergy * 1.85 : 1
          particle.progress += particle.speed * delta * (0.72 + particle.depth * 0.48) * activeFlow
          if (particle.progress > 1.025) {
            particle.progress = -0.025
            particle.offsetX = 0
            particle.offsetY = 0
          }
        }

        const base = beamCoordinates(beam, particle.progress, particle.lateral)
        let localScatter = 0
        if (pointer.beam === particle.beam && pointer.energy > 0.01 && !reducedMotion) {
          const particleX = base.x + particle.offsetX
          const particleY = base.y + particle.offsetY
          const dx = particleX - pointer.x
          const dy = particleY - pointer.y
          const distance = Math.max(1, Math.hypot(dx, dy))
          if (distance < 190) {
            const influence = (1 - distance / 190) ** 2 * pointer.energy
            const curl = 0.019 * influence * (0.55 + particle.depth * 0.75)
            particle.velocityX += (-dy / distance) * curl + pointer.velocityX * influence * 0.008
            particle.velocityY += (dx / distance) * curl + pointer.velocityY * influence * 0.008
            localScatter = influence
          }
        }

        particle.velocityX += Math.sin(time * 0.0002 + particle.phase) * 0.00045 * particle.depth
        particle.velocityY += Math.cos(time * 0.00017 + particle.phase) * 0.00028 * particle.depth
        particle.velocityX *= 0.94
        particle.velocityY *= 0.94
        particle.offsetX = (particle.offsetX + particle.velocityX * delta) * 0.988
        particle.offsetY = (particle.offsetY + particle.velocityY * delta) * 0.988

        const baseX = base.x + particle.offsetX
        const baseY = base.y + particle.offsetY + Math.sin(time * 0.00016 + particle.phase) * (0.8 + particle.depth)
        const glyph = glyphTargets.length
          ? glyphTargets[Math.min(glyphTargets.length - 1, Math.floor(particle.targetSeed * glyphTargets.length))]
          : null
        const shouldGather = state.activeCredo === particle.beam && glyph !== null
        const gatherThreshold = width < 760 ? .28 : .2
        const gatherWeight = particle.gatherAffinity > gatherThreshold
          ? (particle.gatherAffinity - gatherThreshold) / (1 - gatherThreshold)
          : 0
        const targetFocus = shouldGather ? projectionEnergy * gatherWeight * (reducedMotion ? .16 : .92) : 0
        particle.focus += (targetFocus - particle.focus) * (targetFocus > particle.focus ? .075 : .035)
        const glyphX = glyph
          ? glyph.left + glyph.width * (.5 + particle.targetJitterX * .34)
          : baseX
        const glyphY = glyph
          ? glyph.top + glyph.height * (.48 + particle.targetJitterY * .38)
          : baseY
        const x = baseX + (glyphX - baseX) * particle.focus
        const y = baseY + (glyphY - baseY) * particle.focus
        const semanticLift = state.activeCredo === particle.beam ? 0.075 : state.hoveredCredo === particle.beam ? 0.032 : 0
        const volumeLift = beamEnergy[particle.beam] * (0.025 + particle.depth * 0.035)
        const depthFade = 0.58 + particle.depth * 0.42
        const glint = 0.82 + Math.sin(time * (0.00022 + particle.glint * 0.00018) + particle.phase) * 0.18
        const focusLift = particle.focus * (.12 + particle.depth * .11)
        const alpha = (particle.alpha + semanticLift + volumeLift + localScatter * 0.26 + focusLift) * depthFade * (1 - particle.progress * 0.34) * glint
        const color = colors[particle.beam]

        if ((particle.depth > 0.82 && particle.glint > 0.62) || particle.focus > .42) {
          const haloRadius = particle.radius * (1.8 + localScatter * 0.8 + particle.focus * 1.15)
          const halo = context.createRadialGradient(x, y, 0, x, y, haloRadius)
          halo.addColorStop(0, `rgba(${color.join(',')},${alpha * 0.42})`)
          halo.addColorStop(1, `rgba(${color.join(',')},0)`)
          context.fillStyle = halo
          context.beginPath()
          context.arc(x, y, haloRadius, 0, Math.PI * 2)
          context.fill()
        }

        context.beginPath()
        context.fillStyle = `rgba(${color.join(',')},${Math.min(0.62, alpha)})`
        context.ellipse(
          x,
          y,
          particle.radius * (0.72 + particle.depth * 0.48) * particle.stretch * (1 - particle.focus * .2),
          particle.radius * (0.72 + particle.depth * 0.48) * (1 - particle.focus * .2),
          particle.phase * 0.12,
          0,
          Math.PI * 2,
        )
        context.fill()
      })

      context.globalCompositeOperation = 'source-over'
      animationFrame = requestAnimationFrame(render)
    }

    const requestRender = () => {
      if (!animationFrame && pageVisible) animationFrame = requestAnimationFrame(render)
    }
    wakeRef.current = requestRender
    const onPointerMove = (event: PointerEvent) => {
      pointer.targetX = event.clientX
      pointer.targetY = event.clientY
      if (!pointer.active) {
        pointer.x = event.clientX
        pointer.y = event.clientY
        pointer.previousX = event.clientX
        pointer.previousY = event.clientY
      }
      pointer.active = true
    }
    const onPointerLeave = () => {
      pointer.active = false
      pointer.targetX = pointer.x
      pointer.targetY = pointer.y
    }
    const onVisibility = () => {
      pageVisible = !document.hidden
      if (pageVisible) requestRender()
      else if (animationFrame) cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }

    resize()
    requestRender()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('mouseleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)
    const observer = new ResizeObserver(() => {
      readBeams()
      requestRender()
    })
    const stage = document.querySelector('.realm-stage')
    if (stage) observer.observe(stage)

    return () => {
      wakeRef.current = () => undefined
      if (animationFrame) cancelAnimationFrame(animationFrame)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      setHeavenBeamGeometry([])
    }
  }, [])

  return <canvas ref={canvasRef} className="heaven-light-field" aria-hidden="true" />
}
