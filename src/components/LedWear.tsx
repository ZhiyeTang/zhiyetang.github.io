import { useEffect, useRef, type RefObject } from 'react'

const pulseFilter = 'portfolio-led-pulse'

function pickSpot(board: HTMLElement) {
  const pitch = parseFloat(getComputedStyle(board).getPropertyValue('--led-pitch'))
  const screen = board.getBoundingClientRect()
  const panel = board.querySelector('.portfolio-panel')
  const panelBounds = panel?.getBoundingClientRect()
  const range = new Range()
  const areas = []

  for (const element of board.querySelectorAll('h1, h2, h3, canvas:not([hidden]), .portfolio-tab[aria-selected="true"]')) {
    const clip = panel?.contains(element) && panelBounds ? panelBounds : screen
    range.selectNodeContents(element)
    const rects = element instanceof HTMLCanvasElement ? element.getClientRects() : range.getClientRects()
    for (const rect of rects) {
      const left = Math.max(clip.left, rect.left)
      const right = Math.min(clip.right, rect.right)
      const top = Math.max(clip.top, rect.top)
      const bottom = Math.min(clip.bottom, rect.bottom)
      if (right > left && bottom > top) areas.push({ left, top, width: right - left, height: bottom - top })
    }
  }

  const area = areas[Math.floor(Math.random() * areas.length)]
  if (!area || !pitch) return
  const x = area.left + Math.random() * area.width - screen.left
  const y = area.top + (.3 + Math.random() * .45) * area.height - screen.top
  return {
    x: Math.floor(x / pitch) * pitch,
    y: Math.floor(y / pitch) * pitch,
    width: (Math.random() < .55 ? 2 : 1) * pitch,
    height: pitch,
  }
}

export default function LedWear({ emission }: { emission: RefObject<HTMLDivElement> }) {
  const pulse = useRef<SVGFEComponentTransferElement>(null)

  useEffect(() => {
    const board = emission.current
    const bright = pulse.current
    if (!board || !bright) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer = 0

    const schedule = () => {
      if (motion.matches || document.hidden) return
      timer = window.setTimeout(() => {
        if (motion.matches || document.hidden) return
        const spot = pickSpot(board)
        if (!spot) {
          schedule()
          return
        }
        for (const [name, value] of Object.entries(spot)) bright.setAttribute(name, String(value))
        board.style.filter = `url(#${pulseFilter})`
        timer = window.setTimeout(sync, 80 + Math.random() * 70)
      }, 750 + Math.random() * 2700)
    }

    const clear = () => {
      window.clearTimeout(timer)
      board.style.removeProperty('filter')
    }

    const sync = () => {
      clear()
      schedule()
    }

    schedule()
    motion.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      clear()
      motion.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [emission])

  return <div className="portfolio-wear" aria-hidden="true">
    <i /><i /><i /><i /><i />
    <svg width="0" height="0">
      <filter id={pulseFilter} filterUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        {/* Boost the existing emission only within the selected cells. */}
        <feComponentTransfer ref={pulse} in="SourceGraphic" result="boost">
          <feFuncR type="linear" slope="2.8" />
          <feFuncG type="linear" slope="2.8" />
          <feFuncB type="linear" slope="2.8" />
        </feComponentTransfer>
        <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="boost" /></feMerge>
      </filter>
    </svg>
  </div>
}
