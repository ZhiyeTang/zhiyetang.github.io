import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import EarthLibrary from './EarthLibrary'
import HeavenExperience from './heaven/HeavenExperience'
import HellExperience from './hell/HellExperience'
import { setRealmJourneyProgress } from './effects/realmEffectsStore'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const RealmEffectsCanvas = lazy(() => import('./effects/RealmEffectsCanvas'))

type Realm = 'heaven' | 'earth' | 'hell'

export type JourneyCopy = {
  heaven: string
  earth: string
  hell: string
  heavenLine: string
  heavenTitle: string
  heavenBody: string
  title: string
  heroLine: string
  hellLine: string
  hellTime: string
  hellTitle: string
  hellBody: string
  rights: string
}

type Props = {
  language: 'en' | 'zh'
  activeRealm: Realm
  copy: JourneyCopy
  onRealmChange: (realm: Realm) => void
}

export default function RealmJourney({ language, activeRealm, copy: t, onRealmChange }: Props) {
  const journey = useRef<HTMLElement>(null)
  const lastRealm = useRef<Realm>('earth')
  const [enhancedVisuals, setEnhancedVisuals] = useState(false)
  const [realmWebglReady, setRealmWebglReady] = useState(false)
  const handleWebglReady = useCallback(() => setRealmWebglReady(true), [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
    const probe = document.createElement('canvas')
    const webgl = probe.getContext('webgl2') ?? probe.getContext('webgl')
    setEnhancedVisuals(Boolean(webgl) && !reducedMotion && !connection?.saveData && deviceMemory >= 4)
  }, [])

  useGSAP(
    () => {
      const heavenLayer = '.journey-heaven'
      const earthLayer = '.journey-earth'
      const hellLayer = '.journey-hell'
      const heavenMedia = '.journey-heaven .journey-media'
      const earthMedia = '.journey-earth .journey-media'
      const hellMedia = '.journey-hell .journey-media'

      gsap.set(heavenLayer, { opacity: 1, visibility: 'visible' })
      gsap.set(earthLayer, { opacity: 0, visibility: 'visible' })
      gsap.set(hellLayer, { opacity: 0, visibility: 'visible' })
      // Keep the turntable as the shared visual anchor while Heaven and Earth
      // crossfade. Both source images place it at the same normalized point.
      gsap.set(heavenMedia, { scale: 1, transformOrigin: '16% 90%' })
      gsap.set(earthMedia, { scale: 1, transformOrigin: '16% 90%', filter: 'blur(6px)' })
      gsap.set(hellMedia, { scale: 1.16, transformOrigin: '84% 78%', filter: 'blur(6px)' })
      gsap.set('.journey-earth .journey-content, .bookshelf-hotspots, .earth-object-layer, .journey-earth .now-playing', { opacity: 0, y: 24 })
      gsap.set('.journey-hell .hell-experience', { opacity: 0, y: 24 })

      // Match the first interactive layer to a direct realm URL immediately;
      // ScrollTrigger takes over as soon as the page begins moving.
      const initialRealm: Realm = window.location.hash === '#heaven'
        ? 'heaven'
        : window.location.hash === '#hell'
          ? 'hell'
          : 'earth'
      lastRealm.current = initialRealm
      setRealmJourneyProgress(initialRealm === 'heaven' ? 0 : initialRealm === 'earth' ? 0.5 : 1)
      onRealmChange(initialRealm)
      journey.current?.querySelectorAll<HTMLElement>('.journey-layer').forEach((layer) => {
        const isCurrent = layer.classList.contains(`journey-${initialRealm}`)
        layer.inert = !isCurrent
        layer.style.pointerEvents = isCurrent ? 'auto' : 'none'
      })

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const coarsePointer = window.matchMedia('(pointer: coarse)').matches
      const scrubWeight = reducedMotion ? true : coarsePointer ? 1.6 : 2.8

      const syncRealmToVisualProgress = (progress: number) => {
        const realm: Realm = progress < 0.3 ? 'heaven' : progress < 0.7 ? 'earth' : 'hell'
        if (lastRealm.current !== realm) {
          lastRealm.current = realm
          onRealmChange(realm)
          journey.current?.querySelectorAll<HTMLElement>('.journey-layer').forEach((layer) => {
            const isCurrent = layer.classList.contains(`journey-${realm}`)
            layer.inert = !isCurrent
            layer.style.pointerEvents = isCurrent ? 'auto' : 'none'
          })
        }

        const heavenTransit = Math.max(0, 1 - Math.abs(progress - 0.27) / 0.12)
        const hellTransit = Math.max(0, 1 - Math.abs(progress - 0.73) / 0.12)
        window.dispatchEvent(new CustomEvent('realm-transit', {
          detail: {
            strength: Math.max(heavenTransit, hellTransit),
            direction: heavenTransit > hellTransit ? -1 : 1,
          },
        }))
      }

      const timeline = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: journey.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: scrubWeight,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setRealmJourneyProgress(self.progress)
            syncRealmToVisualProgress(self.progress)
          },
        },
      })

      timeline.to({}, { duration: 1.6 })

      timeline.to(heavenMedia, {
        scale: 1.16,
        filter: 'blur(6px)',
        duration: 2.55,
      }, 1.6)
      timeline.to('.journey-heaven .now-playing, .journey-heaven .heaven-turntable-hotspot', { opacity: 0, y: -18, duration: 1.15 }, 1.6)
      timeline.to(heavenLayer, { opacity: 0, duration: 1.55 }, 2.5)
      timeline.to(earthLayer, { opacity: 1, duration: 1.75 }, 2.25)
      timeline.to(earthMedia, { scale: 1.16, filter: 'blur(0px)', duration: 2.55 }, 1.6)
      timeline.to(earthMedia, { scale: 1, duration: 1.3 }, 4.15)
      timeline.to('.journey-earth .journey-content, .bookshelf-hotspots, .earth-object-layer, .journey-earth .now-playing', { opacity: 1, y: 0, duration: 1.3 }, 2.72)
      timeline.to('.heaven-threshold', { opacity: 0.16, duration: 1.18 }, 1.6)
      timeline.to('.heaven-threshold', { opacity: 0, duration: 1.32 }, 2.78)

      timeline.to({}, { duration: 2.4 }, 3.8)

      timeline.to('.journey-earth .journey-content, .bookshelf-hotspots, .earth-object-layer, .journey-earth .now-playing', { opacity: 0, y: -18, duration: 1.05 }, 6.2)
      timeline.to(earthMedia, {
        scale: 1.16,
        transformOrigin: '84% 78%',
        filter: 'blur(6px)',
        duration: 2.55,
      }, 6.2)
      timeline.to(earthLayer, { opacity: 0, duration: 1.55 }, 6.95)
      timeline.to(hellLayer, { opacity: 1, duration: 1.78 }, 6.65)
      timeline.to(hellMedia, { scale: 1, filter: 'blur(0px)', duration: 2.55 }, 6.2)
      timeline.to('.journey-hell .hell-experience', { opacity: 1, y: 0, duration: 1.3 }, 7.32)
      timeline.to('.hell-threshold', { opacity: 0.18, duration: 1.18 }, 6.2)
      timeline.to('.hell-threshold', { opacity: 0, duration: 1.34 }, 7.38)

      timeline.to({}, { duration: 1.6 }, 8.4)

      const wheelState = {
        amount: 0,
        direction: 0,
        lastEventAt: 0,
        locked: false,
      }
      let snapTween: gsap.core.Tween | null = null
      let unlockCall: gsap.core.Tween | null = null
      let previousScrollBehavior = ''

      const restoreScrollBehavior = () => {
        document.documentElement.style.scrollBehavior = previousScrollBehavior
      }

      const unlockWhenWheelSettles = () => {
        const quietFor = performance.now() - wheelState.lastEventAt
        if (quietFor >= 240) {
          wheelState.locked = false
          wheelState.amount = 0
          wheelState.direction = 0
          unlockCall = null
          return
        }

        unlockCall = gsap.delayedCall((240 - quietFor) / 1000, unlockWhenWheelSettles)
      }

      const shouldKeepNativeWheel = (target: EventTarget | null) => {
        if (!(target instanceof Element)) return false
        if (target.closest('input, textarea, select, [contenteditable="true"], .folio-markdown-flow, .object-panel')) return true
        return Boolean(document.querySelector('.library-layer, .object-layer, .pilgrimage-layer.is-open, .hell-panel-layer'))
      }

      const handleRealmWheel = (event: WheelEvent) => {
        if (coarsePointer || event.ctrlKey || shouldKeepNativeWheel(event.target)) return

        const deltaMultiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1
        const delta = event.deltaY * deltaMultiplier
        if (Math.abs(delta) < 1) return

        const now = performance.now()
        const quietFor = now - wheelState.lastEventAt
        wheelState.lastEventAt = now
        if (wheelState.locked) {
          event.preventDefault()
          return
        }

        const anchors = (['heaven', 'earth', 'hell'] as const).map((id) => {
          const marker = document.getElementById(id)
          return marker ? marker.getBoundingClientRect().top + window.scrollY : window.scrollY
        })
        const nearestIndex = anchors.reduce((nearest, position, index) => (
          Math.abs(position - window.scrollY) < Math.abs(anchors[nearest] - window.scrollY) ? index : nearest
        ), 0)
        const direction = delta > 0 ? 1 : -1
        const targetIndex = Math.max(0, Math.min(anchors.length - 1, nearestIndex + direction))

        // Preserve normal page-wheel behavior at the first and last realm.
        if (targetIndex === nearestIndex) return

        event.preventDefault()
        if (quietFor > 180 || wheelState.direction !== direction) {
          wheelState.amount = 0
        }
        wheelState.direction = direction
        wheelState.amount += delta
        if (Math.abs(wheelState.amount) < 72) return

        wheelState.locked = true
        wheelState.amount = 0
        unlockCall?.kill()
        snapTween?.kill()

        const scrollProxy = { y: window.scrollY }
        previousScrollBehavior = document.documentElement.style.scrollBehavior
        document.documentElement.style.scrollBehavior = 'auto'
        snapTween = gsap.to(scrollProxy, {
          y: anchors[targetIndex],
          duration: reducedMotion ? 0.01 : 1.5,
          ease: reducedMotion ? 'none' : 'power2.inOut',
          overwrite: true,
          onUpdate: () => window.scrollTo(0, scrollProxy.y),
          onComplete: () => {
            snapTween = null
            restoreScrollBehavior()
            unlockWhenWheelSettles()
          },
          onInterrupt: () => {
            snapTween = null
            restoreScrollBehavior()
            wheelState.locked = false
          },
        })
      }

      window.addEventListener('wheel', handleRealmWheel, { passive: false })

      return () => {
        window.removeEventListener('wheel', handleRealmWheel)
        snapTween?.kill()
        unlockCall?.kill()
        restoreScrollBehavior()
      }
    },
    { scope: journey },
  )

  return (
    <section ref={journey} className={`realm-journey${realmWebglReady ? ' has-realm-webgl' : ''}`} aria-label="Heaven, Earth and Hell spatial journey">
      <span id="heaven" className="realm-marker realm-marker-heaven" aria-hidden="true" />
      <span id="earth" className="realm-marker realm-marker-earth" aria-hidden="true" />
      <span id="hell" className="realm-marker realm-marker-hell" aria-hidden="true" />

      <div className="realm-stage">
        {enhancedVisuals && (
          <Suspense fallback={null}>
            <RealmEffectsCanvas onReady={handleWebglReady} />
          </Suspense>
        )}
        <article className="journey-layer journey-heaven" aria-label={t.heaven}>
          <picture>
            <source media="(max-width: 820px)" srcSet="/images/heaven-church-mobile-v4.webp" />
            <img className="journey-media" src="/images/heaven-church-v4.webp" alt="A quiet modernist church on Sunday morning, with four stained-glass windows, an archival wall display, and a turntable in the foreground" />
          </picture>
          <div className="journey-wash" />
          <HeavenExperience language={language} isActive={activeRealm === 'heaven'} trackTitle={t.heavenLine} />
        </article>

        <article className="journey-layer journey-earth" aria-label={t.earth}>
          <picture>
            <source media="(max-width: 820px)" srcSet="/images/earth-library-room-integrated-mobile-v2.webp" />
            <img className="journey-media" src="/images/earth-library-room-integrated-v3.webp" alt="Midnight listening room with six books, a turntable, an open research notebook, and paths to a church and an underground bar" />
          </picture>
          <div className="journey-wash" />
          <div className="journey-content earth-content">
            <div className="cursor-parallax-plane">
              <p className="eyebrow">{t.title} · vivo</p>
              <h1>ZHIYE TANG</h1>
              <p className="soul-script">{t.heroLine}</p>
            </div>
          </div>
          <EarthLibrary language={language} isActive={activeRealm === 'earth'} />
        </article>

        <article className="journey-layer journey-hell" aria-label={t.hell}>
          <img className="journey-media" src="/images/hell-listening-bar-v1.webp" alt="Burgundy underground listening bar with an empty record cabinet, cocktail menu, and turntable" />
          <div className="journey-wash" />
          <HellExperience language={language} isActive={activeRealm === 'hell'} />
        </article>

        <div className="journey-threshold heaven-threshold" />
        <div className="journey-threshold hell-threshold" />
      </div>
    </section>
  )
}
