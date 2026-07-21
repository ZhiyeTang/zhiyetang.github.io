import { useEffect, useRef } from 'react'
import { CrosshairSimple } from '@phosphor-icons/react'
import gsap from 'gsap'

type Realm = 'heaven' | 'earth' | 'hell'

const interactiveSelector = [
  'button',
  'a',
  '.book-hotspot',
  '.earth-object',
].join(', ')

const magneticSelector = '[data-cursor-magnetic="true"]'

export default function CursorSignal({ realm }: { realm: Realm }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLSpanElement>(null)
  const haloRef = useRef<HTMLSpanElement>(null)
  const echoRef = useRef<HTMLSpanElement>(null)
  const crosshairRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const core = coreRef.current
    const halo = haloRef.current
    const echo = echoRef.current
    const crosshair = crosshairRef.current
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (!root || !core || !halo || !echo || !crosshair || !finePointer.matches || reducedMotion.matches) return

    const scenePlane = document.querySelector<HTMLElement>('.cursor-parallax-plane')
    const moveCoreX = gsap.quickTo(core, 'x', { duration: 0.16, ease: 'power3.out' })
    const moveCoreY = gsap.quickTo(core, 'y', { duration: 0.16, ease: 'power3.out' })
    const moveHaloX = gsap.quickTo(halo, 'x', { duration: 0.34, ease: 'power3.out' })
    const moveHaloY = gsap.quickTo(halo, 'y', { duration: 0.34, ease: 'power3.out' })
    const moveEchoX = gsap.quickTo(echo, 'x', { duration: 0.72, ease: 'power3.out' })
    const moveEchoY = gsap.quickTo(echo, 'y', { duration: 0.72, ease: 'power3.out' })
    const moveCrosshairX = gsap.quickTo(crosshair, 'x', { duration: 0.24, ease: 'power3.out' })
    const moveCrosshairY = gsap.quickTo(crosshair, 'y', { duration: 0.24, ease: 'power3.out' })
    const moveSceneX = scenePlane ? gsap.quickTo(scenePlane, 'x', { duration: 0.9, ease: 'power3.out' }) : null
    const moveSceneY = scenePlane ? gsap.quickTo(scenePlane, 'y', { duration: 0.9, ease: 'power3.out' }) : null

    let activeMagnetic: HTMLElement | null = null

    const releaseMagnetic = () => {
      if (!activeMagnetic) return
      gsap.to(activeMagnetic, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.42)', overwrite: true })
      activeMagnetic = null
    }

    const onPointerMove = (event: PointerEvent) => {
      const { clientX, clientY } = event
      const normalizedX = clientX / window.innerWidth - 0.5
      const normalizedY = clientY / window.innerHeight - 0.5

      root.classList.add('is-visible')
      moveCoreX(clientX)
      moveCoreY(clientY)
      moveHaloX(clientX)
      moveHaloY(clientY)
      moveEchoX(clientX)
      moveEchoY(clientY)
      moveCrosshairX(clientX)
      moveCrosshairY(clientY)
      moveSceneX?.(normalizedX * -12)
      moveSceneY?.(normalizedY * -8)

      const target = event.target instanceof Element ? event.target : null
      const magnetic = target?.closest<HTMLElement>(magneticSelector) ?? null
      if (magnetic !== activeMagnetic) {
        releaseMagnetic()
        activeMagnetic = magnetic
      }
      if (activeMagnetic) {
        const bounds = activeMagnetic.getBoundingClientRect()
        const offsetX = (clientX - (bounds.left + bounds.width / 2)) / Math.max(bounds.width, 1)
        const offsetY = (clientY - (bounds.top + bounds.height / 2)) / Math.max(bounds.height, 1)
        gsap.to(activeMagnetic, {
          x: offsetX * 5,
          y: offsetY * 4,
          duration: 0.38,
          ease: 'power3.out',
          overwrite: true,
        })
      }

      root.classList.toggle('is-interactive', Boolean(target?.closest(interactiveSelector)))
    }

    const onPointerLeave = () => {
      root.classList.remove('is-visible', 'is-interactive')
      moveSceneX?.(0)
      moveSceneY?.(0)
      releaseMagnetic()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onPointerLeave)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('mouseleave', onPointerLeave)
      releaseMagnetic()
      if (scenePlane) gsap.set(scenePlane, { x: 0, y: 0 })
    }
  }, [])

  return (
    <div ref={rootRef} className={`cursor-signal cursor-signal-${realm}`} aria-hidden="true">
      <span ref={echoRef} className="cursor-signal-echo" />
      <span ref={haloRef} className="cursor-signal-halo" />
      <span ref={coreRef} className="cursor-signal-core" />
      <span ref={crosshairRef} className="cursor-signal-crosshair"><CrosshairSimple size={20} weight="thin" /></span>
    </div>
  )
}
