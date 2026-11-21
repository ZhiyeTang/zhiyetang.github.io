import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { useGSAP } from '@gsap/react'
import { ArrowCounterClockwise, ArrowRight, EnvelopeSimple, NoteBlank } from '@phosphor-icons/react'
import { gsap } from 'gsap'
import { useLanguageContext } from './i18n/LanguageContext'
import LedWear from './components/LedWear'
import PortfolioContent, { LedImage, PortfolioIntro, sections, type PortfolioSection } from './components/PortfolioContent'

gsap.registerPlugin(useGSAP)

const pages = {
  intro: { en: 'About', zh: '简介', title: 'About', icon: null },
  experience: { en: 'Work', zh: '经历', title: 'Experience', icon: null },
  research: { en: 'Lab', zh: '研究', title: 'Research', icon: null },
  life: { en: 'Life', zh: '生活', title: 'Life', icon: null },
  essays: { en: 'Notes', zh: '随笔', title: 'Notes', icon: null },
  contact: { en: 'Contact', zh: '联系', title: 'Contact', icon: EnvelopeSimple },
}

const controlCopy = {
  zh: { navigation: '主页栏目', language: '切换到英文', next: '下一页', home: '回到首页' },
  en: { navigation: 'Portfolio sections', language: 'Switch to Chinese', next: 'Next page', home: 'Back to home' },
}

function pageFromUrl() {
  const [, name, number] = /^#([a-z]+)(?:\/([1-9]\d*))?$/.exec(location.hash) ?? []
  const section = sections.find(id => id === name)
  const page = Number(number)
  return { section: section ?? 'intro', index: section && Number.isSafeInteger(page) ? page - 1 : 0 }
}

function pageStride(content: HTMLElement) {
  return content.getBoundingClientRect().width + parseFloat(getComputedStyle(content).columnGap)
}

function contentPageCount(content: HTMLElement) {
  const stride = pageStride(content)
  const overflowPages = Math.max(1, Math.ceil((content.scrollWidth - 1) / stride))
  if (overflowPages === 1) return 1

  // A browser can allocate a final column just for trailing whitespace.
  const left = content.getBoundingClientRect().left
  const range = new Range()
  const rendered = document.createTreeWalker(content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node instanceof Element) {
        if (node.matches('[hidden], details:not([open]) > :not(summary)')) return NodeFilter.FILTER_REJECT
        return node.matches('img, canvas, button, input') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
      }
      return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    },
  })
  let count = 1
  for (let node = rendered.nextNode(); node; node = rendered.nextNode()) {
    range.selectNodeContents(node)
    const rects = node instanceof Element ? node.getClientRects() : range.getClientRects()
    for (const rect of rects) {
      if (rect.width && rect.height) count = Math.max(count, 1 + Math.floor((rect.left - left + 1) / stride))
    }
    if (count >= overflowPages) return overflowPages
  }
  return count
}

export default function SoulPortfolio() {
  const { language, setLanguage } = useLanguageContext()
  const [address, setAddress] = useState(pageFromUrl)
  const [pageCount, setPageCount] = useState(1)
  const [recordIndex, setRecord] = useState(0)
  const emission = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const flow = useRef<HTMLDivElement>(null)
  const { section } = address
  const pageIndex = Math.min(address.index, pageCount - 1)
  const nextSection = sections[sections.indexOf(section) + 1]
  const hasMore = pageIndex + 1 < pageCount
  const zh = language === 'zh'
  const labels = controlCopy[language]
  const turnLabel = hasMore || nextSection ? labels.next : labels.home
  const page = pages[section]
  const SectionIcon = page.icon
  const intro = section === 'intro'
  const paired = section === 'experience' || section === 'research'
  const title = intro ? zh ? '唐致烨' : 'Zhiye Tang' : zh ? page.zh : page.title

  useLayoutEffect(() => {
    const viewport = panel.current
    const content = flow.current
    if (!viewport || !content) return
    const measure = () => {
      if (content.clientWidth) setPageCount(contentPageCount(content))
    }
    const resize = new ResizeObserver(measure)
    const mutations = new MutationObserver(measure)
    measure()
    resize.observe(viewport)
    mutations.observe(content, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'open'] })
    content.addEventListener('load', measure, true)
    document.fonts.addEventListener('loadingdone', measure)
    return () => {
      resize.disconnect()
      mutations.disconnect()
      content.removeEventListener('load', measure, true)
      document.fonts.removeEventListener('loadingdone', measure)
    }
  }, [section, language, recordIndex])

  useGSAP(() => {
    const content = flow.current
    if (!content || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(content, { opacity: .8 }, { opacity: 1, duration: .18, ease: 'power1.out', clearProps: 'opacity' })
    const art = pageIndex === 0 && content.querySelector('.portfolio-art')
    if (art) gsap.fromTo(art, { scale: .98 }, { scale: 1, duration: .22, ease: 'power1.out', clearProps: 'transform' })
  }, { scope: panel, dependencies: [section, pageIndex, recordIndex], revertOnUpdate: true })

  useEffect(() => {
    const onNavigation = () => setAddress(pageFromUrl())
    window.addEventListener('popstate', onNavigation)
    window.addEventListener('hashchange', onNavigation)
    return () => {
      window.removeEventListener('popstate', onNavigation)
      window.removeEventListener('hashchange', onNavigation)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = zh ? 'zh-CN' : 'en'
    document.title = (zh ? '唐致烨' : 'Zhiye Tang') + ' · ' + page[language]
  }, [language, page, zh])

  function navigate(next: PortfolioSection, nextIndex = 0) {
    if (section === next && address.index === nextIndex) return
    history.pushState(null, '', '#' + next + (nextIndex ? '/' + (nextIndex + 1) : ''))
    setAddress({ section: next, index: nextIndex })
  }

  function onTabKey(event: KeyboardEvent<HTMLElement>) {
    const index = sections.indexOf(section)
    const target = {
      ArrowLeft: (index + sections.length - 1) % sections.length,
      ArrowRight: (index + 1) % sections.length,
      Home: 0,
      End: sections.length - 1,
      ' ': index,
    }[event.key]
    if (!Number.isInteger(target)) return
    event.preventDefault()
    const next = sections[target!]
    navigate(next)
    document.getElementById('portfolio-tab-' + next)?.focus()
  }

  return <div className="portfolio-screen">
    <div ref={emission} className="portfolio-emission">
      <div className="portfolio-frame">
        <header className="portfolio-header">
          <nav className="portfolio-tabs" role="tablist" aria-label={labels.navigation} onKeyDown={onTabKey}>
            {sections.map(id => <a
              className="portfolio-tab"
              key={id}
              id={'portfolio-tab-' + id}
              href={'#' + id}
              role="tab"
              aria-controls="portfolio-panel"
              aria-selected={section === id}
              tabIndex={section === id ? 0 : -1}
              onClick={event => {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.button !== 0) return
                event.preventDefault()
                navigate(id)
              }}
            >{pages[id][language]}</a>)}
          </nav>
          <button className="portfolio-language" type="button" aria-label={labels.language} onClick={() => setLanguage(zh ? 'en' : 'zh')}>
            {zh ? 'EN' : '中'}
          </button>
        </header>
        <main>
          <section ref={panel} id="portfolio-panel" className="portfolio-panel" role="tabpanel" aria-labelledby={'portfolio-tab-' + section} tabIndex={0}>
            <div ref={flow} key={section} className="portfolio-page-flow" style={{ '--page-index': pageIndex } as CSSProperties}
              onFocus={event => {
                const content = event.currentTarget
                const bounds = content.getBoundingClientRect()
                const target = event.target.getClientRects()[0]
                if (!target || !bounds.width) return
                const targetPage = Math.min(pageCount - 1, Math.floor((target.left - bounds.left + 1) / pageStride(content)))
                if (targetPage >= 0 && targetPage !== pageIndex) navigate(section, targetPage)
              }}
            >
              <div className={'portfolio-title' + (intro ? ' portfolio-home' : paired ? ' portfolio-paired-title' : '')}>
                {SectionIcon && <SectionIcon className="portfolio-section-icon" aria-hidden="true" />}
                <div className="portfolio-title-copy">
                  <h1>{title}</h1>
                  {intro && <p className="portfolio-name" lang={zh ? 'en' : 'zh-CN'}>{zh ? 'ZHIYE TANG' : '唐致烨'}</p>}
                </div>
                {intro && <LedImage src="/hero.webp" alt={zh ? '唐致烨的点阵肖像' : 'LED portrait of Zhiye Tang'} portrait />}
                {intro && <PortfolioIntro language={language} />}
              </div>
              <div className="portfolio-content">
                <PortfolioContent section={section} language={language} recordIndex={recordIndex} onRecordChange={next => {
                  setRecord(next)
                  panel.current?.focus()
                  navigate('life')
                }} />
              </div>
            </div>
          </section>
        </main>
      </div>
      <footer className="portfolio-footer">
        <output className="portfolio-page-number">{pageCount > 1 ? (pageIndex + 1) + ' / ' + pageCount : ''}</output>
        <button className="portfolio-turn" type="button" aria-label={turnLabel} title={turnLabel}
          onClick={() => hasMore ? navigate(section, pageIndex + 1) : navigate(nextSection ?? 'intro')}>
          {hasMore || nextSection
            ? <><NoteBlank size={34} weight="bold" aria-hidden="true" /><ArrowRight className="portfolio-turn-arrow" size={14} weight="bold" aria-hidden="true" /></>
            : <ArrowCounterClockwise size={26} weight="bold" aria-hidden="true" />}
        </button>
      </footer>
      <LedWear emission={emission} />
    </div>
  </div>
}
