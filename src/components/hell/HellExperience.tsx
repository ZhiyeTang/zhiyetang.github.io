import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react'
import gsap from 'gsap'
import { cocktailSelections, recordSelections, type HellLanguage } from '../../data/hell'
import SoulPlayer from '../SoulPlayer'

type HellPanel = 'records' | 'menu'

type Props = {
  language: HellLanguage
  isActive: boolean
}

const RECORDS_PER_PAGE = 6
const recordPages = Array.from(
  { length: Math.ceil(recordSelections.length / RECORDS_PER_PAGE) },
  (_, index) => recordSelections.slice(index * RECORDS_PER_PAGE, (index + 1) * RECORDS_PER_PAGE),
)

const text = {
  en: {
    records: 'The wall',
    recordsHint: 'Open the record cabinet',
    menu: 'The pour',
    menuHint: 'Open the cocktail book',
    play: 'Play Really Love',
    pause: 'Pause Really Love',
    collection: 'Twelve records · twelve points of view',
    drinks: 'A temporary pour · awaiting the personal list',
    previous: 'Previous spread',
    next: 'Next spread',
    previousRecords: 'Previous six records',
    nextRecords: 'Next six records',
    recordPagination: 'Record wall pages',
    close: 'Close',
  },
  zh: {
    records: '唱片墙',
    recordsHint: '打开唱片橱柜',
    menu: '酒单',
    menuHint: '翻开鸡尾酒册',
    play: '播放 Really Love',
    pause: '暂停 Really Love',
    collection: '十二张唱片 · 十二种表达',
    drinks: '临时酒单 · 等待个人酒单清单',
    previous: '上一组',
    next: '下一组',
    previousRecords: '前六张唱片',
    nextRecords: '后六张唱片',
    recordPagination: '唱片墙分页',
    close: '关闭',
  },
} as const

export default function HellExperience({ language, isActive }: Props) {
  const [activePanel, setActivePanel] = useState<HellPanel | null>(null)
  const [selectedRecord, setSelectedRecord] = useState(recordSelections[0].id)
  const [recordPage, setRecordPage] = useState(0)
  const [menuPage, setMenuPage] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackToggle, setPlaybackToggle] = useState(0)
  const panelRootRef = useRef<HTMLDivElement>(null)
  const panelSurfaceRef = useRef<HTMLDivElement>(null)
  const recordGridRef = useRef<HTMLDivElement>(null)
  const menuContentRef = useRef<HTMLDivElement>(null)
  const labels = text[language]
  const record = recordSelections.find((entry) => entry.id === selectedRecord) ?? recordSelections[0]
  const visibleRecords = recordPages[recordPage]
  const menuSpreads = useMemo(() => (
    Array.from({ length: Math.ceil(cocktailSelections.length / 4) }, (_, index) => (
      cocktailSelections.slice(index * 4, index * 4 + 4)
    ))
  ), [])
  const visibleDrinks = menuSpreads[menuPage]

  useEffect(() => {
    if (isActive) return
    setActivePanel(null)
    if (isPlaying) setPlaybackToggle((value) => value + 1)
  }, [isActive, isPlaying])

  useEffect(() => {
    if (!activePanel) return
    const preventJourneyScroll = (event: Event) => event.preventDefault()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel()
      if (activePanel === 'records' && event.key === 'ArrowLeft') turnRecords(Math.max(0, recordPage - 1))
      if (activePanel === 'records' && event.key === 'ArrowRight') turnRecords(Math.min(recordPages.length - 1, recordPage + 1))
      if (activePanel === 'menu' && event.key === 'ArrowLeft') turnMenu(Math.max(0, menuPage - 1))
      if (activePanel === 'menu' && event.key === 'ArrowRight') turnMenu(Math.min(menuSpreads.length - 1, menuPage + 1))
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', preventJourneyScroll, { passive: false })
    window.addEventListener('touchmove', preventJourneyScroll, { passive: false })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', preventJourneyScroll)
      window.removeEventListener('touchmove', preventJourneyScroll)
    }
  })

  useLayoutEffect(() => {
    if (!activePanel || !panelRootRef.current || !panelSurfaceRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scrim = panelRootRef.current.querySelector('.hell-panel-scrim')
    if (!reduced) {
      gsap.timeline()
        .fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: .42, ease: 'power2.out' }, 0)
        .fromTo(
          panelSurfaceRef.current,
          { opacity: 0, y: 28, scale: activePanel === 'records' ? .82 : .72, rotateX: activePanel === 'menu' ? 6 : 0 },
          { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: .86, ease: 'expo.out' },
          .04,
        )
    }
    panelSurfaceRef.current?.focus({ preventScroll: true })
  }, [activePanel])

  const openPanel = (panel: HellPanel) => {
    if (panel === 'menu') setMenuPage(0)
    setActivePanel(panel)
  }

  const closePanel = () => {
    if (!panelRootRef.current || !panelSurfaceRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActivePanel(null)
      return
    }
    const scrim = panelRootRef.current.querySelector('.hell-panel-scrim')
    gsap.timeline({ onComplete: () => setActivePanel(null) })
      .to(panelSurfaceRef.current, { opacity: 0, y: 18, scale: .94, duration: .34, ease: 'power3.inOut' }, 0)
      .to(scrim, { opacity: 0, duration: .32, ease: 'power2.in' }, .02)
  }

  const turnMenu = (nextPage: number) => {
    if (nextPage === menuPage || !menuContentRef.current) return
    const direction = nextPage > menuPage ? 1 : -1
    const content = menuContentRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setMenuPage(nextPage)
      return
    }
    gsap.killTweensOf(content)
    gsap.to(content, {
      opacity: 0,
      x: direction * 28,
      rotateY: direction * -5,
      duration: .22,
      ease: 'power2.in',
      onComplete: () => {
        setMenuPage(nextPage)
        requestAnimationFrame(() => {
          gsap.fromTo(
            content,
            { opacity: 0, x: direction * -28, rotateY: direction * 5 },
            { opacity: 1, x: 0, rotateY: 0, duration: .52, ease: 'power3.out' },
          )
        })
      },
    })
  }

  const turnRecords = (nextPage: number) => {
    if (nextPage === recordPage || !recordGridRef.current || !recordPages[nextPage]) return
    const direction = nextPage > recordPage ? 1 : -1
    const grid = recordGridRef.current
    const showNextPage = () => {
      setRecordPage(nextPage)
      setSelectedRecord(recordPages[nextPage][0].id)
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      showNextPage()
      return
    }
    gsap.killTweensOf(grid)
    gsap.to(grid, {
      opacity: 0,
      x: direction * 22,
      duration: .18,
      ease: 'power2.in',
      onComplete: () => {
        showNextPage()
        requestAnimationFrame(() => {
          gsap.fromTo(
            grid,
            { opacity: 0, x: direction * -22 },
            { opacity: 1, x: 0, duration: .42, ease: 'power3.out' },
          )
        })
      },
    })
  }

  return (
    <>
      <div className="hell-experience">
        <div className="hell-media-coordinates" aria-hidden={!isActive}>
          <button
            type="button"
            className="realm-hotspot hell-hotspot hell-record-wall-hotspot"
            onClick={() => openPanel('records')}
            aria-label={labels.recordsHint}
          >
            <span className="realm-hotspot-aura hell-hotspot-aura" aria-hidden="true" />
            <span className="realm-hotspot-label hell-hotspot-label">{labels.records}</span>
          </button>
          <button
            type="button"
            className="realm-hotspot hell-hotspot hell-menu-hotspot"
            onClick={() => openPanel('menu')}
            aria-label={labels.menuHint}
          >
            <span className="realm-hotspot-aura hell-hotspot-aura" aria-hidden="true" />
            <span className="realm-hotspot-label hell-hotspot-label">{labels.menu}</span>
          </button>
          <button
            type="button"
            className={`realm-hotspot hell-hotspot hell-turntable-hotspot${isPlaying ? ' is-playing' : ''}`}
            onClick={() => setPlaybackToggle((value) => value + 1)}
            aria-label={isPlaying ? labels.pause : labels.play}
            aria-pressed={isPlaying}
          >
            <span className="realm-hotspot-aura hell-hotspot-aura" aria-hidden="true" />
            <span className="realm-hotspot-label hell-hotspot-label">SOUL FM</span>
          </button>
        </div>

        <SoulPlayer
          language={language}
          toggleSignal={playbackToggle}
          onPlayingChange={setIsPlaying}
          source="/audio/really-love.mp3"
          artist="D’Angelo and The Vanguard"
          title="Really Love"
          variant="hell"
        />
      </div>

      {activePanel && createPortal(
        <div ref={panelRootRef} className={`hell-panel-layer hell-panel-layer-${activePanel}`} role="dialog" aria-modal="true" aria-labelledby="hell-panel-title">
          <button className="hell-panel-scrim" onClick={closePanel} aria-label={labels.close} />

          {activePanel === 'records' ? (
            <div ref={panelSurfaceRef} className="hell-record-panel" tabIndex={-1}>
              <div className="hell-panel-topline">
                <div>
                  <span id="hell-panel-title">{labels.records}</span>
                  <small>{labels.collection}</small>
                </div>
                <button onClick={closePanel} aria-label={labels.close}><X size={23} weight="light" /></button>
              </div>

              <div className="record-cabinet-stage">
                <img src="/images/hell-record-cabinet-v1.webp" alt="" aria-hidden="true" />
                <div ref={recordGridRef} className="record-cabinet-grid">
                  {visibleRecords.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className={entry.id === selectedRecord ? 'is-selected' : ''}
                      onClick={() => setSelectedRecord(entry.id)}
                      aria-label={`${entry.artist} · ${entry.title}`}
                      aria-pressed={entry.id === selectedRecord}
                    >
                      <img src={entry.image} alt={`${entry.title} — ${entry.artist}`} />
                    </button>
                  ))}
                </div>
                <nav className="record-cabinet-navigation" aria-label={labels.recordPagination}>
                  <button
                    type="button"
                    onClick={() => turnRecords(Math.max(0, recordPage - 1))}
                    disabled={recordPage === 0}
                    aria-label={labels.previousRecords}
                  >
                    <ArrowLeft size={17} />
                  </button>
                  <span aria-live="polite">
                    {String(recordPage + 1).padStart(2, '0')} / {String(recordPages.length).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => turnRecords(Math.min(recordPages.length - 1, recordPage + 1))}
                    disabled={recordPage === recordPages.length - 1}
                    aria-label={labels.nextRecords}
                  >
                    <ArrowRight size={17} />
                  </button>
                </nav>
              </div>

              <div className="record-selection-copy" aria-live="polite">
                <div><span>{record.year}</span><strong>{record.artist}</strong></div>
                <div><h3>{record.title}</h3><p>{record.note[language]}</p></div>
              </div>
            </div>
          ) : (
            <div ref={panelSurfaceRef} className="hell-menu-panel" tabIndex={-1}>
              <button className="hell-menu-close" onClick={closePanel} aria-label={labels.close}><X size={23} weight="light" /></button>
              <img className="hell-menu-book" src="/images/library/open-book-spread-v1.webp" alt="" aria-hidden="true" />
              <div className="hell-menu-heading">
                <span id="hell-panel-title">{labels.menu}</span>
                <small>{labels.drinks}</small>
              </div>
              <div ref={menuContentRef} className="hell-menu-pages" aria-live="polite">
                {[visibleDrinks.slice(0, 2), visibleDrinks.slice(2, 4)].map((pageDrinks, pageIndex) => (
                  <div key={`${menuPage}-${pageIndex}`} className="hell-menu-page">
                    <span className="hell-menu-page-number">0{menuPage * 2 + pageIndex + 1}</span>
                    {pageDrinks.map((drink) => (
                      <article key={drink.name}>
                        <p>{drink.base[language]}</p>
                        <h3>{drink.name}</h3>
                        <span>{drink.ingredients[language]}</span>
                        <em>{drink.note[language]}</em>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
              <div className="hell-menu-navigation">
                <button onClick={() => turnMenu(Math.max(0, menuPage - 1))} disabled={menuPage === 0} aria-label={labels.previous}><ArrowLeft size={20} /></button>
                <span>{String(menuPage + 1).padStart(2, '0')} / {String(menuSpreads.length).padStart(2, '0')}</span>
                <button onClick={() => turnMenu(Math.min(menuSpreads.length - 1, menuPage + 1))} disabled={menuPage === menuSpreads.length - 1} aria-label={labels.next}><ArrowRight size={20} /></button>
              </div>
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  )
}
