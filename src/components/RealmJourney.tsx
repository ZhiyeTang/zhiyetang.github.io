import { lazy, Suspense, useEffect, useRef } from 'react'
import EarthLibrary from './EarthLibrary'
import HeavenExperience from './heaven/HeavenExperience'
import HellExperience from './hell/HellExperience'
import './connected-realms.css'

const ConnectedRealms = lazy(() => import('./ConnectedRealms'))

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
  const progress = useRef(.5)
  useEffect(() => {
    const update = () => {
      if (!journey.current) return
      const rect = journey.current.getBoundingClientRect()
      progress.current = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)))
      onRealmChange(progress.current < .37 ? 'heaven' : progress.current < .66 ? 'earth' : 'hell')
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [onRealmChange])
  return <section ref={journey} className="realm-journey connected-journey" aria-label={language === 'zh' ? '三境空间漫游' : 'Connected realms journey'}>
    <span id="heaven" className="realm-marker realm-marker-heaven" />
    <span id="earth" className="realm-marker realm-marker-earth" />
    <span id="hell" className="realm-marker realm-marker-hell" />
    <div className="realm-stage">
      <Suspense fallback={<div className="model-status">{language === 'zh' ? '正在载入空间…' : 'Loading the space…'}</div>}><ConnectedRealms progress={progress} language={language} /></Suspense>
      <div className="space-caption"><span>{t[activeRealm]} / {activeRealm === 'earth' ? 'ZHIYE TANG' : activeRealm === 'heaven' ? 'TOUCHING GOD' : 'REALLY LOVE'}</span><p>{language === 'zh' ? '滚动穿越 · 拖动环视 · 方向键调整视角' : 'Scroll to travel · Drag or use arrow keys to look around'}</p></div>
      <div className="space-content" key={activeRealm}>
        {activeRealm === 'earth' && <EarthLibrary language={language} isActive />}
        {activeRealm === 'heaven' && <HeavenExperience language={language} isActive trackTitle={t.heavenLine} />}
        {activeRealm === 'hell' && <HellExperience language={language} isActive />}
      </div>
    </div>
  </section>
}
