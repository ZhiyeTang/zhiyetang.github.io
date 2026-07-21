import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { footprints, heavenLabels, type HeavenLanguage } from '../../data/heaven'

gsap.registerPlugin(useGSAP)

type Rect = { left: number; top: number; width: number; height: number }
type Position = { x: number; y: number }

type Props = {
  language: HeavenLanguage
  isActive: boolean
  isOpen: boolean
  dimmed: boolean
  wallTarget: HTMLElement | null
  onOpen: () => void
  onClose: () => void
}

type DragState = {
  id: string
  pointerId: number
  startX: number
  startY: number
  lastX: number
  lastY: number
  velocityX: number
  velocityY: number
  moved: boolean
}

const desktopQuad = {
  image: '/images/heaven-church-v4.webp',
  width: 1672,
  height: 941,
  // Sample the engraved map surface, not its wooden frame. The expanded
  // shell supplies its own frame, so including the source frame creates a
  // doubled strip that is especially visible along the right edge.
  anchors: [[120, 239], [622, 336], [622, 626], [120, 648]] as const,
}

const mobileQuad = {
  image: '/images/heaven-church-mobile-v4.webp',
  width: 853,
  height: 1844,
  anchors: [[36, 532], [333, 633], [333, 1005], [36, 1068]] as const,
}

const clampPosition = ({ x, y }: Position): Position => ({
  x: Math.min(92, Math.max(5, x)),
  y: Math.min(86, Math.max(8, y)),
})

export default function PilgrimageArchive({ language, isActive, isOpen, dimmed, wallTarget, onOpen, onClose }: Props) {
  const shellRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const inertiaRef = useRef<Record<string, number>>({})
  const suppressClickRef = useRef(false)
  const [wallRect, setWallRect] = useState<Rect>({ left: 0, top: 0, width: 0, height: 0 })
  const [positions, setPositions] = useState<Record<string, Position>>(() => Object.fromEntries(footprints.map((entry) => [entry.id, entry.mapPosition])))
  const [dragging, setDragging] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [presented, setPresented] = useState(isOpen)
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  useEffect(() => {
    if (isOpen) setPresented(true)
  }, [isOpen])

  useEffect(() => {
    if (!wallTarget) return
    const update = () => {
      const rect = wallTarget.getBoundingClientRect()
      setWallRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(wallTarget)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update)
    }
  }, [wallTarget])

  useEffect(() => {
    if (!isOpen) {
      setDragging(null)
      setSelected(null)
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => () => {
    Object.values(inertiaRef.current).forEach(cancelAnimationFrame)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isActive || canvas.dataset.rectified === 'true') return
    const quad = window.innerWidth < 700 ? mobileQuad : desktopQuad
    const context = canvas.getContext('2d')
    if (!context) return
    let cancelled = false
    let renderFrame = 0
    const image = new Image()
    image.decoding = 'async'
    image.src = quad.image
    image.onload = () => {
      if (cancelled) return
      const outputWidth = 1400
      const outputHeight = 886
      canvas.width = outputWidth
      canvas.height = outputHeight
      context.clearRect(0, 0, outputWidth, outputHeight)
      const [topLeft, topRight, bottomRight, bottomLeft] = quad.anchors
      let x = 0
      canvas.dataset.rectified = 'loading'
      const renderChunk = () => {
        const deadline = performance.now() + 4
        while (x < outputWidth && performance.now() < deadline) {
          const u = x / outputWidth
          const nextU = Math.min(1, (x + 3) / outputWidth)
          const sourceX = topLeft[0] + (topRight[0] - topLeft[0]) * u
          const nextSourceX = topLeft[0] + (topRight[0] - topLeft[0]) * nextU
          const sourceTop = topLeft[1] + (topRight[1] - topLeft[1]) * u
          const sourceBottom = bottomLeft[1] + (bottomRight[1] - bottomLeft[1]) * u
          context.drawImage(
            image,
            sourceX,
            sourceTop,
            Math.max(1, nextSourceX - sourceX + .8),
            sourceBottom - sourceTop,
            x,
            0,
            3.5,
            outputHeight,
          )
          x += 3
        }
        if (cancelled) return
        if (x < outputWidth) {
          renderFrame = requestAnimationFrame(renderChunk)
          return
        }
        canvas.dataset.rectified = 'true'
        canvas.dataset.source = quad.image
      }
      renderFrame = requestAnimationFrame(renderChunk)
    }
    return () => {
      cancelled = true
      if (renderFrame) cancelAnimationFrame(renderFrame)
    }
  }, [isActive])

  useGSAP(() => {
    const shell = shellRef.current
    if (!shell || !presented) return
    const backdrop = shell.previousElementSibling
    const surface = shell.querySelector('.pilgrimage-map-canvas')
    const tags = shell.querySelectorAll('.pilgrimage-map-tag')
    const heading = shell.querySelector('.pilgrimage-map-heading')
    const close = shell.querySelector('.pilgrimage-close')
    const chrome = [heading, close].filter(Boolean)
    gsap.killTweensOf([shell, backdrop, surface, tags, ...chrome])

    if (reducedMotion) {
      gsap.set([shell, backdrop, surface, tags, ...chrome], { clearProps: 'all' })
      if (!isOpen) setPresented(false)
      return
    }

    const timeline = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        if (!isOpen) {
          // The collapsed map reuses this shell as the wall-sized trigger.
          // Remove the closing animation's transform/opacity before React
          // reapplies the measured wall coordinates for the next opening.
          gsap.set(shell, { clearProps: 'opacity,transform,clipPath' })
          gsap.set(backdrop, { clearProps: 'opacity' })
          gsap.set(surface, { clearProps: 'opacity,transform' })
          setPresented(false)
        }
      },
    })

    if (isOpen) {
      timeline
        .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: .48, ease: 'power2.out' }, 0)
        .fromTo(shell,
          { opacity: 0, y: 18, scale: .9, clipPath: 'inset(12% 16% 14% 16%)' },
          { opacity: 1, y: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: .76, ease: 'expo.out' },
          0,
        )
        .fromTo(surface,
          { opacity: .42, scale: 1.045 },
          { opacity: 1, scale: 1, duration: .9, ease: 'power3.out' },
          .06,
        )
        .fromTo(chrome,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: .42, stagger: .04, ease: 'power2.out' },
          .28,
        )
        .fromTo(tags,
          { opacity: 0, '--tag-enter-y': '14px', '--tag-enter-scale': .94 },
          { opacity: 1, '--tag-enter-y': '0px', '--tag-enter-scale': 1, duration: .5, stagger: .055, ease: 'power3.out', clearProps: 'opacity,--tag-enter-y,--tag-enter-scale' },
          .34,
        )
    } else {
      timeline
        .to(tags, { opacity: 0, '--tag-enter-y': '8px', duration: .18, stagger: { each: .025, from: 'end' }, ease: 'power2.in' }, 0)
        .to(chrome, { opacity: 0, y: 5, duration: .2, ease: 'power2.in' }, 0)
        .to(shell, { opacity: 0, y: 12, scale: .94, clipPath: 'inset(8% 12% 10% 12%)', duration: .42, ease: 'power3.inOut' }, .04)
        .to(backdrop, { opacity: 0, duration: .36, ease: 'power2.in' }, .05)
    }

    return () => timeline.kill()
  }, { scope: shellRef, dependencies: [isOpen, presented, reducedMotion] })

  const updatePosition = (id: string, next: Position) => {
    setPositions((current) => ({ ...current, [id]: clampPosition(next) }))
  }

  const stopInertia = (id: string) => {
    if (inertiaRef.current[id]) cancelAnimationFrame(inertiaRef.current[id])
    delete inertiaRef.current[id]
  }

  const onTagPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    if (!isOpen) return
    stopInertia(id)
    dragRef.current = {
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      velocityX: 0,
      velocityY: 0,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(id)
    setSelected(id)
  }

  const onTagPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    const shell = shellRef.current
    if (!drag || drag.pointerId !== event.pointerId || !shell) return
    const rect = shell.getBoundingClientRect()
    const dx = event.clientX - drag.lastX
    const dy = event.clientY - drag.lastY
    drag.velocityX = dx / Math.max(1, rect.width) * 100 * .22
    drag.velocityY = dy / Math.max(1, rect.height) * 100 * .22
    drag.lastX = event.clientX
    drag.lastY = event.clientY
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4) drag.moved = true
    setPositions((current) => ({
      ...current,
      [drag.id]: clampPosition({
        x: current[drag.id].x + dx / Math.max(1, rect.width) * 100,
        y: current[drag.id].y + dy / Math.max(1, rect.height) * 100,
      }),
    }))
  }

  const onTagPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    suppressClickRef.current = drag.moved
    dragRef.current = null
    setDragging(null)
    const id = drag.id
    let velocityX = drag.velocityX
    let velocityY = drag.velocityY
    if (reducedMotion || !drag.moved) return
    const glide = () => {
      velocityX *= .9
      velocityY *= .9
      if (Math.abs(velocityX) + Math.abs(velocityY) < .04) {
        delete inertiaRef.current[id]
        return
      }
      setPositions((current) => ({
        ...current,
        [id]: clampPosition({ x: current[id].x + velocityX, y: current[id].y + velocityY }),
      }))
      inertiaRef.current[id] = requestAnimationFrame(glide)
    }
    inertiaRef.current[id] = requestAnimationFrame(glide)
  }

  const onTagClick = (id: string) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    setSelected(id)
  }

  const onTagKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, id: string) => {
    const step = event.shiftKey ? 4 : 1.5
    const direction = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }[event.key]
    if (!direction) return
    event.preventDefault()
    updatePosition(id, { x: positions[id].x + direction[0], y: positions[id].y + direction[1] })
    setSelected(id)
  }

  const shellStyle = presented ? undefined : {
    left: `${wallRect.left}px`,
    top: `${wallRect.top}px`,
    width: `${wallRect.width}px`,
    height: `${wallRect.height}px`,
  }
  const triggerStyle = presented ? undefined : {
    ...shellStyle,
    '--atlas-label-x': `${Math.max(8, 12 - wallRect.left)}px`,
    '--atlas-label-y': `${Math.max(8, 12 - wallRect.top)}px`,
  } as CSSProperties

  const map = (
    <div className={`pilgrimage-layer pilgrimage-map-layer ${presented ? 'is-open' : ''} ${presented && !isOpen ? 'is-closing' : ''} ${dimmed ? 'is-dimmed' : ''}`} aria-hidden={!isActive}>
      <div className="pilgrimage-backdrop" onClick={onClose} />
      <section ref={shellRef} className="pilgrimage-perspective-map" style={shellStyle} aria-label={heavenLabels.pilgrimage[language]}>
        <canvas ref={canvasRef} className="pilgrimage-map-canvas" aria-hidden="true" />
        {presented && (
          <>
            <header className="pilgrimage-map-heading">
              <span>{heavenLabels.pilgrimage[language]}</span>
              <small>{heavenLabels.archiveInstructions[language]}</small>
            </header>
            <button className="pilgrimage-close" type="button" onClick={onClose} aria-label={heavenLabels.closePilgrimage[language]}>
              <X size={20} weight="light" />
            </button>
            <div className="pilgrimage-map-tag-layer">
              {footprints.map((entry) => {
                const position = positions[entry.id]
                const style = { '--tag-x': `${position.x}%`, '--tag-y': `${position.y}%` } as CSSProperties
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={`pilgrimage-map-tag ${dragging === entry.id ? 'is-dragging' : ''} ${selected === entry.id ? 'is-selected' : ''}`}
                    style={style}
                    onPointerDown={(event) => onTagPointerDown(event, entry.id)}
                    onPointerMove={onTagPointerMove}
                    onPointerUp={onTagPointerUp}
                    onPointerCancel={onTagPointerUp}
                    onClick={() => onTagClick(entry.id)}
                    onKeyDown={(event) => onTagKeyDown(event, entry.id)}
                    aria-label={`${entry.city[language]}. ${language === 'zh' ? '可拖动照片标签' : 'Draggable photograph tag'}`}
                    aria-pressed={selected === entry.id}
                  >
                    <i className="archive-pin" aria-hidden="true" />
                    <span className="pilgrimage-tag-photo">
                      {entry.image ? (
                        <img src={entry.image} alt={entry.imageAlt?.[language] ?? entry.city[language]} />
                      ) : (
                        <span className="archive-undeveloped" aria-hidden="true" />
                      )}
                    </span>
                    <strong>{entry.city[language]}</strong>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </section>
      {!presented && (
        <button
          className="realm-hotspot pilgrimage-map-trigger"
          style={triggerStyle}
          type="button"
          onClick={onOpen}
          aria-label={heavenLabels.openPilgrimage[language]}
        >
          <span className="interaction-aura realm-hotspot-aura" aria-hidden="true" />
          <span className="realm-hotspot-label">{heavenLabels.atlas[language]}</span>
        </button>
      )}
    </div>
  )

  return createPortal(map, document.body)
}
