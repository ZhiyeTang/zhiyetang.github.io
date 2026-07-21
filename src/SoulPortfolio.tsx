import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Church, Martini, VinylRecord, Waveform } from '@phosphor-icons/react'
import { useLanguage } from './i18n'
import RealmJourney from './components/RealmJourney'
import CursorSignal from './components/CursorSignal'

type Realm = 'heaven' | 'earth' | 'hell'

const copy = {
  en: {
    heaven: 'Heaven',
    earth: 'Earth',
    hell: 'Hell',
    heavenLine: 'Touching God',
    heavenTitle: 'A quiet place for light.',
    heavenBody: 'Faith, care, and the stillness before the first note enters the room.',
    title: 'Image Algorithm Engineer',
    heroLine: 'I build perception that feels less like tech, more like truth.',
    hellLine: 'Really Love',
    hellTime: 'After hours, 01:47 AM',
    hellTitle: 'Stay with the groove.',
    hellBody: 'Only rhythm, unfinished thoughts, and the last light behind the bar.',
    rights: 'Built between research hours and the last track of the night.',
  },
  zh: {
    heaven: '天堂',
    earth: '人间',
    hell: '地狱',
    heavenLine: 'Touching God',
    heavenTitle: '留给光的一处安静空间。',
    heavenBody: '信念、关怀，以及第一颗音符进入房间之前的寂静。',
    title: '影像算法工程师',
    heroLine: '我创造感知，让技术少一点技术感，多一点真实。',
    hellLine: 'Really Love',
    hellTime: '散场之后，凌晨 01:47',
    hellTitle: '留在律动里。',
    hellBody: '这里只留下节拍、未完成的念头，以及吧台背后的最后一盏灯。',
    rights: '完成于研究时段与深夜最后一首歌之间。',
  },
}

const realmOrder: Realm[] = ['heaven', 'earth', 'hell']
const realmSymbols: Record<Realm, string> = {
  heaven: '△',
  earth: '○',
  hell: '▽',
}
const realmIdentityIcons = {
  heaven: Church,
  earth: VinylRecord,
  hell: Martini,
}

export default function SoulPortfolio() {
  const root = useRef<HTMLDivElement>(null)
  const { language, setLanguage } = useLanguage()
  const t = copy[language]
  const [activeRealm, setActiveRealm] = useState<Realm>('earth')
  const [menuOpen, setMenuOpen] = useState(false)

  useLayoutEffect(() => {
    if (window.location.hash) return
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    const earth = document.getElementById('earth')
    if (!earth) return
    const jumpToEarth = () => {
      const previousBehavior = document.documentElement.style.scrollBehavior
      document.documentElement.style.scrollBehavior = 'auto'
      window.scrollTo({ top: earth.offsetTop, behavior: 'auto' })
      document.documentElement.style.scrollBehavior = previousBehavior
    }
    jumpToEarth()
    const frame = requestAnimationFrame(jumpToEarth)
    const settle = window.setTimeout(jumpToEarth, 180)
    window.addEventListener('pageshow', jumpToEarth)
    window.addEventListener('load', jumpToEarth)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(settle)
      window.removeEventListener('pageshow', jumpToEarth)
      window.removeEventListener('load', jumpToEarth)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    document.title = language === 'zh' ? '唐致烨 · 灵魂频率' : 'Zhiye Tang · Soul Frequency'
  }, [language])

  useEffect(() => {
    const imageReady = Array.from(document.images).map((image) => (
      image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => resolve(), { once: true })
          })
    ))
    Promise.all([document.fonts.ready, ...imageReady]).then(() => {
      ScrollTrigger.refresh()
      if (!window.location.hash) {
        const earth = document.getElementById('earth')
        if (earth) requestAnimationFrame(() => {
          const previousBehavior = document.documentElement.style.scrollBehavior
          document.documentElement.style.scrollBehavior = 'auto'
          window.scrollTo({ top: earth.offsetTop, behavior: 'auto' })
          document.documentElement.style.scrollBehavior = previousBehavior
        })
      }
    })
  }, [])

  const scrollTo = (id: Realm) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={root} className="soul-site">
      <CursorSignal realm={activeRealm} />

      <header className={`soul-nav nav-${activeRealm}`}>
        <button className="mobile-menu" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen}>
          <Waveform size={24} />
          <span className="sr-only">Menu</span>
        </button>

        <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Primary navigation">
          {realmOrder.map((realm) => {
            const IdentityIcon = realmIdentityIcons[realm]
            const isActive = activeRealm === realm
            return (
              <button
                key={realm}
                className={isActive ? 'is-active' : ''}
                data-cursor-magnetic="true"
                onClick={() => scrollTo(realm)}
                aria-label={t[realm]}
                title={t[realm]}
              >
                <span className="realm-symbol realm-symbol-identity" aria-hidden="true">
                  <IdentityIcon size={isActive ? 22 : 20} weight={isActive ? 'regular' : 'light'} />
                </span>
              </button>
            )
          })}
        </nav>

        <div className="language-switch" aria-label="Language">
          <button className={language === 'en' ? 'is-active' : ''} data-cursor-magnetic="true" onClick={() => setLanguage('en')}>EN</button>
          <span>/</span>
          <button className={language === 'zh' ? 'is-active' : ''} data-cursor-magnetic="true" onClick={() => setLanguage('zh')}>中</button>
        </div>
      </header>

      <aside className={`realm-rail rail-${activeRealm}`} aria-label="Realm navigation">
        <div className="rail-line" />
        {realmOrder.map((realm) => (
          <button
            key={realm}
            className={activeRealm === realm ? 'is-active' : ''}
            data-cursor-magnetic="true"
            onClick={() => scrollTo(realm)}
            aria-label={language === 'zh' ? `前往${t[realm]}` : `Go to ${t[realm]}`}
            title={t[realm]}
          >
            <span className="realm-symbol realm-symbol-direction" aria-hidden="true">{realmSymbols[realm]}</span>
          </button>
        ))}
      </aside>

      <main>
        <RealmJourney
          language={language}
          activeRealm={activeRealm}
          copy={t}
          onRealmChange={setActiveRealm}
        />
      </main>
    </div>
  )
}
