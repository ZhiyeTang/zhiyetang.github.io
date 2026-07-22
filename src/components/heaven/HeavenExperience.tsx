import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { credo, type HeavenLanguage } from '../../data/heaven'
import SoulPlayer from '../SoulPlayer'
import HeavenLightField from './HeavenLightField'
import PilgrimageArchive from './PilgrimageArchive'

gsap.registerPlugin(useGSAP)

type Props = {
  language: HeavenLanguage
  isActive: boolean
  trackTitle: string
}

export default function HeavenExperience({ language, isActive, trackTitle }: Props) {
  const mapTargetRef = useRef<HTMLDivElement>(null)
  const credoInscriptionRef = useRef<HTMLDivElement>(null)
  const [mapTarget, setMapTarget] = useState<HTMLElement | null>(null)
  const [activeCredo, setActiveCredo] = useState<number | null>(null)
  const [hoveredCredo, setHoveredCredo] = useState<number | null>(null)
  const [pilgrimageOpen, setPilgrimageOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackToggle, setPlaybackToggle] = useState(0)

  useEffect(() => setMapTarget(mapTargetRef.current), [])
  useEffect(() => {
    if (!isActive) {
      setActiveCredo(null)
      setHoveredCredo(null)
      setPilgrimageOpen(false)
    }
  }, [isActive])
  useEffect(() => {
    if (!isActive && isPlaying) setPlaybackToggle((value) => value + 1)
  }, [isActive, isPlaying])

  const openCredo = (index: number) => {
    setPilgrimageOpen(false)
    setActiveCredo((current) => current === index ? null : index)
  }

  useGSAP(() => {
    if (activeCredo === null) return
    const copy = credoInscriptionRef.current?.querySelector('.credo-light-copy')
    if (!copy) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.fromTo(copy,
      { opacity: 0, y: reducedMotion ? 0 : 10, filter: reducedMotion ? 'none' : 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', delay: reducedMotion ? 0 : .16, duration: reducedMotion ? .01 : 1.4, ease: 'power3.out', clearProps: 'transform,filter' },
    )
  }, { scope: credoInscriptionRef, dependencies: [activeCredo] })

  return (
    <div className={`heaven-experience ${pilgrimageOpen || activeCredo !== null ? 'has-open-content' : ''}`}>
      <div className="heaven-media-coordinates" aria-hidden={!isActive}>
        <div ref={mapTargetRef} className="pilgrimage-wall-anchor" />
        <button
          type="button"
          className={`realm-hotspot earth-object heaven-turntable-hotspot${isPlaying ? ' is-playing' : ''}`}
          onClick={() => setPlaybackToggle((value) => value + 1)}
          aria-label={isPlaying
            ? (language === 'zh' ? '暂停 Touching God' : 'Pause Touching God')
            : (language === 'zh' ? '播放 Touching God' : 'Play Touching God')}
          aria-pressed={isPlaying}
        >
          <span className="interaction-aura realm-hotspot-aura object-aura" aria-hidden="true" />
          <span className="turntable-platter-effect" aria-hidden="true" />
          <span className="realm-hotspot-label hotspot-label">SOUL FM</span>
        </button>
        <div className={`credo-windows ${pilgrimageOpen ? 'is-dimmed' : ''}`}>
          {credo.map((entry, index) => (
            <button
              key={entry.id}
              type="button"
              data-credo-window={entry.id}
              className={`realm-hotspot credo-window credo-window-${index + 1} ${activeCredo === index ? 'is-active' : ''}`}
              onPointerEnter={() => setHoveredCredo(index)}
              onPointerLeave={() => setHoveredCredo(null)}
              onFocus={() => setHoveredCredo(index)}
              onBlur={() => setHoveredCredo(null)}
              onClick={() => openCredo(index)}
              aria-expanded={activeCredo === index}
              aria-label={`${entry.label[language]}: ${entry.text[language]}`}
            >
              <span className="interaction-aura realm-hotspot-aura credo-aura" aria-hidden="true" />
              <span className="realm-hotspot-label credo-label">{entry.label[language]}</span>
            </button>
          ))}
        </div>
      </div>

      <HeavenLightField isActive={isActive} hoveredCredo={hoveredCredo} activeCredo={activeCredo} />

      <SoulPlayer
        language={language}
        toggleSignal={playbackToggle}
        onPlayingChange={setIsPlaying}
        source="/audio/touching-god.mp3"
        artist="Daniel Caesar"
        title={trackTitle}
        variant="heaven"
      />

      <div ref={credoInscriptionRef} className={`credo-inscription ${activeCredo !== null ? 'is-visible' : ''}`} aria-live="polite">
        {activeCredo !== null && (
          <div key={credo[activeCredo].id} className="credo-light-copy">
            <p data-text={credo[activeCredo].text[language]}>{credo[activeCredo].text[language]}</p>
          </div>
        )}
      </div>

      <PilgrimageArchive
        language={language}
        isActive={isActive}
        isOpen={pilgrimageOpen}
        dimmed={activeCredo !== null}
        wallTarget={mapTarget}
        onOpen={() => {
          setActiveCredo(null)
          setPilgrimageOpen(true)
        }}
        onClose={() => setPilgrimageOpen(false)}
      />
    </div>
  )
}
