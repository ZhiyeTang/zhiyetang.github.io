import { useEffect, useRef } from 'react'

type Realm = 'heaven' | 'earth' | 'hell'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  phase: number
  depth: number
}

const palettes: Record<Realm, [number, number, number]> = {
  heaven: [255, 225, 169],
  earth: [105, 196, 220],
  hell: [214, 112, 61],
}

function makeParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    size: 0.55 + Math.random() * 1.8,
    alpha: 0.18 + Math.random() * 0.58,
    phase: Math.random() * Math.PI * 2,
    depth: 0.35 + Math.random() * 0.9,
  }
}

export default function ParticleField({ realm }: { realm: Realm }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const realmRef = useRef(realm)

  useEffect(() => {
    realmRef.current = realm
  }, [realm])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: -1000, y: -1000, active: false }
    const transit = { strength: 0, direction: 1 }
    const color = { r: palettes[realmRef.current][0], g: palettes[realmRef.current][1], b: palettes[realmRef.current][2] }
    let width = window.innerWidth
    let height = window.innerHeight
    let particles: Particle[] = []
    let animationFrame = 0
    let previousScroll = window.scrollY
    let scrollImpulse = 0
    let lastTime = performance.now()

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = reducedMotion ? 36 : width < 760 ? 62 : Math.min(170, Math.round(width * 0.105))
      particles = Array.from({ length: count }, () => makeParticle(width, height))
    }

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
    }
    const onPointerLeave = () => { pointer.active = false }
    const onScroll = () => {
      const delta = window.scrollY - previousScroll
      scrollImpulse = Math.max(-18, Math.min(18, delta * 0.055))
      previousScroll = window.scrollY
    }
    const onTransit = (event: Event) => {
      const detail = (event as CustomEvent<{ strength: number; direction: number }>).detail
      transit.strength = detail?.strength ?? 0
      transit.direction = detail?.direction ?? 1
    }

    const wrap = (particle: Particle) => {
      const margin = 30
      if (particle.x < -margin) particle.x = width + margin
      if (particle.x > width + margin) particle.x = -margin
      if (particle.y < -margin) particle.y = height + margin
      if (particle.y > height + margin) particle.y = -margin
    }

    const render = (time: number) => {
      const delta = Math.min(2, (time - lastTime) / 16.67)
      lastTime = time
      const currentRealm = realmRef.current
      const target = palettes[currentRealm]
      color.r += (target[0] - color.r) * 0.035
      color.g += (target[1] - color.g) * 0.035
      color.b += (target[2] - color.b) * 0.035
      scrollImpulse *= 0.9

      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = currentRealm === 'heaven' ? 'source-over' : 'screen'
      const seconds = time * 0.001

      particles.forEach((particle, index) => {
        if (!reducedMotion) {
          if (currentRealm === 'heaven') {
            particle.vx += Math.sin(seconds * 0.32 + particle.phase) * 0.002 * particle.depth
            particle.vy += (-0.012 - particle.depth * 0.008) * delta
            particle.vx *= 0.985
            particle.vy *= 0.988
          } else if (currentRealm === 'earth') {
            const wave = height * 0.5 + Math.sin(particle.x * 0.009 + seconds * 0.8 + particle.phase) * (44 + particle.depth * 70)
            particle.vy += (wave - particle.y) * 0.00013 * particle.depth * delta
            particle.vx += (0.006 + Math.cos(seconds * 0.45 + particle.phase) * 0.003) * delta
            particle.vx *= 0.994
            particle.vy *= 0.984
          } else {
            particle.vx += Math.sin(seconds * 0.22 + particle.phase) * 0.0015 * particle.depth
            particle.vy += (0.005 + particle.depth * 0.004) * delta
            particle.vx *= 0.974
            particle.vy *= 0.972
          }

          if (pointer.active) {
            const dx = pointer.x - particle.x
            const dy = pointer.y - particle.y
            const distanceSquared = dx * dx + dy * dy
            if (distanceSquared < 26000 && distanceSquared > 80) {
              const force = (1 - distanceSquared / 26000) * 0.012 * particle.depth
              particle.vx -= dx * force * 0.02
              particle.vy -= dy * force * 0.02
            }
          }

          if (transit.strength > 0.02) {
            const portalX = width * 0.9
            const portalY = height * (transit.direction < 0 ? 0.18 : 0.78)
            const dx = portalX - particle.x
            const dy = portalY - particle.y
            const pull = 0.000018 * transit.strength * particle.depth * delta
            particle.vx += dx * pull
            particle.vy += dy * pull
          }

          particle.y += (particle.vy + scrollImpulse * particle.depth * 0.14) * delta
          particle.x += particle.vx * delta
          wrap(particle)
        }

        const pulse = 0.72 + Math.sin(seconds * (0.55 + particle.depth * 0.28) + particle.phase) * 0.28
        const edgeBias = currentRealm === 'earth' ? Math.max(0.28, particle.x / width) : 1
        const alpha = particle.alpha * pulse * edgeBias
        context.beginPath()
        context.fillStyle = `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${alpha})`
        context.arc(particle.x, particle.y, particle.size * particle.depth, 0, Math.PI * 2)
        context.fill()

        if (transit.strength > 0.05 && !reducedMotion) {
          const trail = 7 + transit.strength * 34
          context.beginPath()
          context.strokeStyle = `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${alpha * transit.strength * 0.32})`
          context.lineWidth = Math.max(0.45, particle.size * 0.42)
          context.moveTo(particle.x, particle.y)
          context.lineTo(particle.x - particle.vx * trail, particle.y - particle.vy * trail)
          context.stroke()
        }

        if (index % 3 === 0 && !reducedMotion) {
          const next = particles[(index + 7) % particles.length]
          const dx = next.x - particle.x
          const dy = next.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const limit = currentRealm === 'earth' ? 118 : 82
          if (distance < limit) {
            context.beginPath()
            context.strokeStyle = `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${(1 - distance / limit) * alpha * 0.22})`
            context.lineWidth = 0.55
            context.moveTo(particle.x, particle.y)
            context.lineTo(next.x, next.y)
            context.stroke()
          }
        }
      })

      context.globalCompositeOperation = 'source-over'
      if (!reducedMotion) animationFrame = requestAnimationFrame(render)
    }

    resize()
    render(performance.now())
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('mouseleave', onPointerLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('realm-transit', onTransit)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseleave', onPointerLeave)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('realm-transit', onTransit)
    }
  }, [])

  return <canvas ref={canvasRef} className={`particle-field particle-${realm}`} aria-hidden="true" />
}
