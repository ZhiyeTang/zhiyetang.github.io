import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import {
  ArrowLeft,
  ArrowRight,
  X,
} from '@phosphor-icons/react'
import { books, type BookKey, type Language } from '../lib/books'
import BookPaginationMeasurer from './BookPaginationMeasurer'
import LightMarkdownPage from './LightMarkdownPage'
import SoulPlayer from './SoulPlayer'

type DeskObjectKey = 'turntable' | 'notebook'

const bookOrder: BookKey[] = ['resume', 'work', 'education', 'research', 'patents', 'notes', 'selections']

const labels: Record<Language, Record<BookKey, string>> = {
  en: {
    resume: 'Resume',
    work: 'Work',
    education: 'Education',
    research: 'Research',
    patents: 'Patents',
    notes: 'Notes',
    selections: 'Selected',
  },
  zh: {
    resume: '简历',
    work: '工作',
    education: '教育',
    research: '研究',
    patents: '专利',
    notes: '随记',
    selections: '私藏',
  },
}

const deskLabels: Record<Language, Record<DeskObjectKey, string>> = {
  en: { turntable: 'SOUL FM', notebook: 'Open notebook' },
  zh: { turntable: 'SOUL FM', notebook: '打开手记' },
}

type Props = {
  language: Language
  isActive: boolean
}

export default function EarthLibrary({ language, isActive }: Props) {
  const [activeBook, setActiveBook] = useState<BookKey | null>(null)
  const [activeObject, setActiveObject] = useState<DeskObjectKey | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackToggle, setPlaybackToggle] = useState(0)
  const [page, setPage] = useState(0)
  const [singlePageMode, setSinglePageMode] = useState(() => window.matchMedia('(max-width: 820px)').matches)
  const [paginatedBook, setPaginatedBook] = useState<{ key: string; pages: typeof books[Language][BookKey] } | null>(null)
  const folio = useRef<HTMLDivElement>(null)
  const spread = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const objectPanel = useRef<HTMLDivElement>(null)
  const objectCloseButton = useRef<HTMLButtonElement>(null)
  const library = books[language]
  const sourceEntries = activeBook ? library[activeBook] : []
  const paginationKey = `${language}:${activeBook ?? ''}:${singlePageMode ? 'single' : 'spread'}`
  const entries = paginatedBook?.key === paginationKey ? paginatedBook.pages : sourceEntries
  const pagesPerSpread = singlePageMode ? 1 : 2
  const spreadCount = Math.ceil(entries.length / pagesPerSpread)
  const leftPage = entries[page * pagesPerSpread]
  const rightPage = pagesPerSpread === 2 ? entries[page * pagesPerSpread + 1] : undefined
  const visibleChapter = rightPage && rightPage.kind !== 'blank'
    ? rightPage.chapter
    : leftPage && leftPage.kind !== 'blank'
      ? leftPage.chapter
      : labels[language][activeBook ?? 'resume']
  const visibleArticleTitle = rightPage?.kind === 'content'
    ? rightPage.title
    : leftPage?.kind === 'content'
      ? leftPage.title
      : ''

  useEffect(() => {
    if (!isActive && isPlaying) setPlaybackToggle((value) => value + 1)
  }, [isActive, isPlaying])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px)')
    const onChange = (event: MediaQueryListEvent) => setSinglePageMode(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(0, spreadCount - 1)))
  }, [spreadCount])

  const acceptPagination = useCallback((nextPages: typeof sourceEntries) => {
    setPaginatedBook((current) => {
      if (current?.key === paginationKey && JSON.stringify(current.pages) === JSON.stringify(nextPages)) return current
      return { key: paginationKey, pages: nextPages }
    })
  }, [paginationKey])

  const openBook = (book: BookKey) => {
    setPage(0)
    setActiveBook(book)
  }

  const animateHotspotSelection = (element: HTMLButtonElement, selected: boolean) => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!canHover || reduced) return

    const aura = element.querySelector('.interaction-aura')
    const label = element.querySelector('.hotspot-label, .book-spine-title')
    const restingLabelOpacity = label?.classList.contains('book-spine-title') ? 0.68 : 0
    gsap.to(aura, {
      opacity: selected ? 1 : 0,
      scale: selected ? 1.018 : 0.985,
      duration: selected ? 0.62 : 0.42,
      ease: selected ? 'power3.out' : 'power2.out',
      overwrite: true,
    })
    gsap.to(label, {
      opacity: selected ? 1 : restingLabelOpacity,
      y: selected ? -2 : 0,
      duration: selected ? 0.58 : 0.38,
      ease: selected ? 'power3.out' : 'power2.out',
      overwrite: true,
    })
  }

  const closeBook = () => {
    if (!folio.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActiveBook(null)
      return
    }
    gsap.to(folio.current, {
      opacity: 0,
      scale: 0.78,
      y: 58,
      rotateX: 8,
      rotateY: -5,
      duration: 0.52,
      ease: 'power4.in',
      onComplete: () => setActiveBook(null),
    })
  }

  const turnPage = useCallback((nextPage: number) => {
    if (nextPage === page) return
    const spreadElement = spread.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!spreadElement || reduced) {
      setPage(nextPage)
      return
    }

    const direction = nextPage > page ? 1 : -1
    gsap.killTweensOf(spreadElement)
    gsap.to(spreadElement, {
      opacity: 0.08,
      x: direction * 30,
      rotateY: direction * -11,
      scale: 0.985,
      duration: 0.24,
      ease: 'power2.in',
      onComplete: () => {
        setPage(nextPage)
        requestAnimationFrame(() => {
          gsap.fromTo(
            spreadElement,
            { opacity: 0.08, x: direction * -30, rotateY: direction * 11, scale: 0.985 },
            { opacity: 1, x: 0, rotateY: 0, scale: 1, duration: 0.58, ease: 'power3.out' },
          )
        })
      },
    })
  }, [page])

  const closeObject = () => {
    if (!objectPanel.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActiveObject(null)
      return
    }
    gsap.to(objectPanel.current, {
      opacity: 0,
      y: 26,
      scale: 0.96,
      duration: 0.36,
      ease: 'power3.in',
      onComplete: () => {
        setActiveObject(null)
      },
    })
  }

  useLayoutEffect(() => {
    if (!activeBook || !folio.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced) {
      gsap.fromTo(
        folio.current,
        { opacity: 0, scale: 0.62, y: 82, rotateX: 13, rotateY: -6 },
        { opacity: 1, scale: 1, y: 0, rotateX: 0, rotateY: 0, duration: 1.08, ease: 'power4.out' },
      )
    }
    closeButton.current?.focus({ preventScroll: true })
  }, [activeBook])

  useLayoutEffect(() => {
    if (!activeObject || !objectPanel.current) return
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(
        objectPanel.current,
        { opacity: 0, y: 30, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.72, ease: 'power4.out' },
      )
    }
    objectCloseButton.current?.focus({ preventScroll: true })
  }, [activeObject])

  useEffect(() => {
    if (!activeBook) return
    const preventJourneyScroll = (event: Event) => event.preventDefault()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeBook()
      if (event.key === 'ArrowLeft') turnPage(Math.max(0, page - 1))
      if (event.key === 'ArrowRight') turnPage(Math.min(spreadCount - 1, page + 1))
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', preventJourneyScroll, { passive: false })
    window.addEventListener('touchmove', preventJourneyScroll, { passive: false })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', preventJourneyScroll)
      window.removeEventListener('touchmove', preventJourneyScroll)
    }
  }, [activeBook, page, spreadCount, turnPage])

  useEffect(() => {
    if (!activeObject) return
    const preventJourneyScroll = (event: Event) => event.preventDefault()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeObject()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', preventJourneyScroll, { passive: false })
    window.addEventListener('touchmove', preventJourneyScroll, { passive: false })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', preventJourneyScroll)
      window.removeEventListener('touchmove', preventJourneyScroll)
    }
  }, [activeObject])

  return (
    <>
      <div className="bookshelf-hotspots" aria-label={language === 'zh' ? '个人书架' : 'Personal library'}>
        {bookOrder.map((book) => (
          <button
            key={book}
            className={`realm-hotspot book-hotspot book-hotspot-${book}`}
            onClick={() => openBook(book)}
            onPointerEnter={(event) => animateHotspotSelection(event.currentTarget, true)}
            onPointerLeave={(event) => animateHotspotSelection(event.currentTarget, false)}
            onFocus={(event) => animateHotspotSelection(event.currentTarget, true)}
            onBlur={(event) => animateHotspotSelection(event.currentTarget, false)}
            aria-label={`${language === 'zh' ? '打开' : 'Open'} ${labels[language][book]}`}
          >
            <span className="interaction-aura realm-hotspot-aura book-aura" aria-hidden="true" />
            <span className="book-spine-title">{labels[language][book]}</span>
            <span className="realm-hotspot-label book-hotspot-label">{labels[language][book]}</span>
          </button>
        ))}
      </div>

      <div className="earth-object-layer" aria-label={language === 'zh' ? '可交互书桌' : 'Interactive listening desk'}>
        {(['turntable', 'notebook'] as DeskObjectKey[]).map((object) => (
          <button
            key={object}
            className={`realm-hotspot earth-object earth-object-${object}${object === 'turntable' && isPlaying ? ' is-playing' : ''}`}
            onClick={() => object === 'turntable' ? setPlaybackToggle((value) => value + 1) : setActiveObject(object)}
            onPointerEnter={(event) => animateHotspotSelection(event.currentTarget, true)}
            onPointerLeave={(event) => animateHotspotSelection(event.currentTarget, false)}
            onFocus={(event) => animateHotspotSelection(event.currentTarget, true)}
            onBlur={(event) => animateHotspotSelection(event.currentTarget, false)}
            aria-label={object === 'turntable'
              ? (isPlaying
                  ? (language === 'zh' ? '暂停 Isn’t She Lovely' : 'Pause Isn’t She Lovely')
                  : (language === 'zh' ? '播放 Isn’t She Lovely' : 'Play Isn’t She Lovely'))
              : deskLabels[language][object]}
            aria-pressed={object === 'turntable' ? isPlaying : undefined}
          >
            <span className="interaction-aura realm-hotspot-aura object-aura" aria-hidden="true" />
            {object === 'turntable' && <span className="turntable-platter-effect" aria-hidden="true" />}
            <span className="realm-hotspot-label hotspot-label">{deskLabels[language][object]}</span>
          </button>
        ))}
      </div>

      <SoulPlayer language={language} toggleSignal={playbackToggle} onPlayingChange={setIsPlaying} />

      {activeObject && (
        <div className="object-layer" role="dialog" aria-modal="true" aria-labelledby="object-panel-title">
          <button className="library-scrim" onClick={closeObject} aria-label={language === 'zh' ? '关闭面板' : 'Close panel'} />
          <div ref={objectPanel} className={`object-panel object-panel-${activeObject}`}>
            <div className="object-panel-topline">
              <span>{deskLabels[language][activeObject]}</span>
              <button ref={objectCloseButton} onClick={closeObject} aria-label={language === 'zh' ? '关闭' : 'Close'}><X size={21} weight="light" /></button>
            </div>

            {activeObject === 'notebook' && (
              <div className="notebook-pages">
                <div>
                  <p>{language === 'zh' ? '正在研究' : 'In progress'}</p>
                  <h3 id="object-panel-title">{language === 'zh' ? '让设备真正理解所见。' : 'Helping devices understand what they see.'}</h3>
                </div>
                <ul>
                  <li><span>01</span>{language === 'zh' ? '端侧多模态智能与高效部署' : 'On-device multimodal intelligence'}</li>
                  <li><span>02</span>{language === 'zh' ? '由 LLM 驱动的数据工程工作流' : 'LLM-driven data engineering workflows'}</li>
                  <li><span>03</span>{language === 'zh' ? '3DGS、影像感知与可解释体验' : '3DGS, visual perception, and legible experiences'}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {activeBook && entries.length > 0 && createPortal(
        <div className="library-layer" role="dialog" aria-modal="true" aria-labelledby="folio-title">
          <button className="library-scrim" onClick={closeBook} aria-label={language === 'zh' ? '关闭书本' : 'Close book'} />
          <div ref={folio} className="library-folio">
            <img className="folio-book-surface" src="/images/library/open-book-spread-v1.webp" alt="" aria-hidden="true" />
            <div className="folio-topline">
              <span id="folio-title">{visibleChapter} · {String(page + 1).padStart(2, '0')} / {String(spreadCount).padStart(2, '0')}</span>
              <div className="folio-topline-actions">
                {visibleArticleTitle && <strong aria-live="polite">{visibleArticleTitle}</strong>}
                <button ref={closeButton} onClick={closeBook} aria-label={language === 'zh' ? '关闭' : 'Close'}><X size={22} weight="light" /></button>
              </div>
            </div>

            <div ref={spread} className="folio-pages" aria-live="polite">
              <LightMarkdownPage page={leftPage} side="left" />
              {pagesPerSpread === 2 && <LightMarkdownPage page={rightPage} side="right" />}
              <BookPaginationMeasurer
                pages={sourceEntries}
                preserveSpreads={!singlePageMode}
                onPagesChange={acceptPagination}
              />
            </div>

            <div className="folio-navigation">
              <button onClick={() => turnPage(Math.max(0, page - 1))} disabled={page === 0}>
                <ArrowLeft size={18} /><span>{language === 'zh' ? '上一页' : 'Previous'}</span>
              </button>
              <button onClick={() => turnPage(Math.min(spreadCount - 1, page + 1))} disabled={page === spreadCount - 1}>
                <span>{language === 'zh' ? '下一页' : 'Next'}</span><ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
