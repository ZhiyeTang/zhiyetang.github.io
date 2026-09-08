import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Euler, Group, MathUtils, Mesh, MeshStandardMaterial, Quaternion, Texture, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

// Blender Z-up to glTF Y-up. Positions follow the verified stairs, not a curve through walls.
const point = (x: number, y: number, z: number) => new Vector3(x, z, -y)
const stops = [
  [0, [3.54, 19, 4.96], [3.54, 27, 5.4]],
  [0.08, [3.54, 19, 4.96], [3.54, 27, 5.4]],
  [0.18, [3.54, 9.2, 4.96], [3.54, 5, 3.8]],
  [0.23, [3.54, 5.85, 4.96], [3.54, 0, 1.8]],
  [0.34, [3.54, 0.65, 1.85], [-1, 1, 2]],
  [0.37, [3.54, -0.35, 1.85], [-2, 3, 2.4]],
  [0.43, [1.3, -4.8, 3.2], [-1.6, 2.2, 2.5]],
  [0.57, [1.3, -4.8, 3.2], [-1.6, 2.2, 2.5]],
  [0.63, [3.54, -0.35, 1.85], [10, -0.35, -0.6]],
  [0.66, [5.5, -0.35, 1.85], [10, -0.35, -0.6]],
  [0.74, [9.95, -0.35, -0.25], [15, -0.35, -2.3]],
  [0.76, [10.5, -0.35, -0.25], [15, -0.35, -2.3]],
  [0.84, [14.5, -0.35, -2.35], [23, -0.35, -2]],
  [0.92, [21.85, -0.35, -2.258], [27, -0.35, -1.9]],
  [1, [21.85, -0.35, -2.258], [27, -0.35, -1.9]],
] as const
const poses = stops.map(([t, p, target]) => {
  const position = point(p[0], p[1], p[2])
  const direction = point(target[0], target[1], target[2]).sub(position)
  const yaw = Math.atan2(-direction.x, -direction.z)
  const pitch = Math.atan2(direction.y, Math.hypot(direction.x, direction.z))
  return { t, position, rotation: new Quaternion().setFromEuler(new Euler(pitch, yaw, 0, 'YXZ')) }
})

type Props = { progress: MutableRefObject<number>; language: 'en' | 'zh' }
function Scene({ progress, onStatus }: { progress: Props['progress']; onStatus: (value: string) => void }) {
  const [model, setModel] = useState<Group>()
  const { camera, gl, invalidate } = useThree()
  const look = useRef({ x: 0, y: 0, dragging: false, px: 0, py: 0 })
  const smoothed = useRef(progress.current)
  const offset = useRef(new Quaternion())
  const reduced = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    let cancelled = false
    const draco = new DRACOLoader().setDecoderPath('/models/draco/').setDecoderConfig({ type: 'wasm' })
    const loader = new GLTFLoader().setDRACOLoader(draco)
    let loaded: Group | undefined
    loader.load('/models/connected-realms.glb', (gltf) => {
      loaded = gltf.scene
      if (cancelled) { dispose(); return }
      gltf.scene.traverse((obj) => {
        if (!(obj instanceof Mesh)) return
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
        materials.forEach((mat) => {
          if (mat instanceof MeshStandardMaterial && mat.alphaMap) { mat.alphaTest = 0.45; mat.transparent = false }
        })
      })
      setModel(gltf.scene); onStatus('ready'); invalidate()
    }, (event) => onStatus(event.total ? `${Math.round(event.loaded / event.total * 100)}%` : 'loading'), () => { if (!cancelled) onStatus('error') })
    function dispose() {
      loaded?.traverse((obj) => {
        if (!(obj instanceof Mesh)) return
        obj.geometry.dispose()
        for (const mat of Array.isArray(obj.material) ? obj.material : [obj.material]) {
          for (const value of Object.values(mat)) if (value instanceof Texture) value.dispose()
          mat.dispose()
        }
      })
    }
    return () => { cancelled = true; draco.dispose(); dispose() }
  }, [invalidate, onStatus])
  useEffect(() => {
    const canvas = gl.domElement
    canvas.tabIndex = 0
    canvas.setAttribute('aria-label', '3D interior. Drag or use arrow keys to look around. Home resets the view.')
    const down = (e: PointerEvent) => { look.current.dragging = true; look.current.px = e.clientX; look.current.py = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.focus() }
    const move = (e: PointerEvent) => {
      const l = look.current
      if (!l.dragging) return
      l.x -= (e.clientX - l.px) * 0.004; l.y = MathUtils.clamp(l.y - (e.clientY - l.py) * 0.003, -0.75, 0.75)
      l.px = e.clientX; l.py = e.clientY; invalidate()
    }
    const up = () => { look.current.dragging = false }
    const key = (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return
      e.preventDefault()
      if (e.key === 'Home') look.current.x = look.current.y = 0
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') look.current.x += e.key === 'ArrowLeft' ? 0.12 : -0.12
      else look.current.y = MathUtils.clamp(look.current.y + (e.key === 'ArrowUp' ? 0.1 : -0.1), -0.75, 0.75)
      invalidate()
    }
    const scroll = () => { look.current.x = look.current.y = 0; invalidate() }
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('keydown', key)
    window.addEventListener('scroll', scroll, { passive: true })
    return () => {
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('keydown', key)
      window.removeEventListener('scroll', scroll)
    }
  }, [gl, invalidate])
  useFrame((_, dt) => {
    smoothed.current = reduced.current ? progress.current : MathUtils.damp(smoothed.current, progress.current, 7, Math.min(dt, 0.1))
    const p = smoothed.current
    const i = Math.max(0, poses.findIndex((pose) => pose.t >= p) - 1)
    const a = poses[i], b = poses[i + 1]
    const mix = MathUtils.clamp((p - a.t) / (b.t - a.t), 0, 1)
    camera.position.lerpVectors(a.position, b.position, mix)
    camera.quaternion.slerpQuaternions(a.rotation, b.rotation, mix)
    offset.current.setFromEuler(new Euler(look.current.y, look.current.x, 0, 'YXZ'))
    camera.quaternion.multiply(offset.current)
    gl.domElement.dataset.progress = p.toFixed(3)
    gl.domElement.dataset.triangles = String(gl.info.render.triangles)
    gl.domElement.dataset.drawCalls = String(gl.info.render.calls)
    if (Math.abs(p - progress.current) > 0.00001) invalidate()
  })
  return <><hemisphereLight args={['#fff0d4', '#463020', 2]} />{model && <primitive object={model} />}</>
}

export default function ConnectedRealms({ progress, language }: Props) {
  const [status, setStatus] = useState('loading')
  return <div className="connected-canvas">
    <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ fov: 65, near: 0.06, far: 90 }} gl={{ antialias: true, powerPreference: 'high-performance' }} fallback={<p className="model-status">{language === 'zh' ? '此浏览器无法显示 3D 场景，请启用硬件加速。' : 'Enable hardware acceleration to view the 3D scene.'}</p>}>
      <color attach="background" args={['#100d09']} />
      <Scene progress={progress} onStatus={setStatus} />
    </Canvas>
    {status !== 'ready' && <div className="model-status" role="status">{status === 'error' ? <><p>{language === 'zh' ? '模型加载失败，请重试。' : 'The model could not load.'}</p><button onClick={() => window.location.reload()}>{language === 'zh' ? '重新加载' : 'Reload'}</button></> : <>{language === 'zh' ? '正在进入三境' : 'Entering the three realms'} · {status === 'loading' ? '…' : status}</>}</div>}
  </div>
}
