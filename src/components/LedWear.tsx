import { useEffect, useRef, type RefObject } from 'react'

const pulseFilter = 'portfolio-led-pulse'
const dropout = { gain: [.06, .08, .12], duration: 82 }
const surge = { gain: [3.4, .38, 2.8], duration: 112 }

function pickSpot(board: HTMLElement, opening: boolean) {
  const pitch = parseFloat(getComputedStyle(board).getPropertyValue('--led-pitch'))
  const screen = board.getBoundingClientRect()
  const panel = board.querySelector('.portfolio-panel')
  const panelBounds = panel?.getBoundingClientRect()
  const range = new Range()
  const areas = []

  for (const element of board.querySelectorAll('h1, h2, h3, .portfolio-tab[aria-selected="true"]')) {
    const clip = panel?.contains(element) && panelBounds ? panelBounds : screen
    range.selectNodeContents(element)
    for (const rect of range.getClientRects()) {
      const left = Math.max(clip.left, rect.left)
      const right = Math.min(clip.right, rect.right)
      const top = Math.max(clip.top, rect.top)
      const bottom = Math.min(clip.bottom, rect.bottom)
      if (right > left && bottom > top) {
        areas.push({ left, top, width: right - left, height: bottom - top, headline: element.tagName === 'H1' })
      }
    }
  }

  const headlines = areas.filter(area => area.headline)
  const candidates = headlines.length && (opening || Math.random() < .7) ? headlines : areas
  const area = candidates[Math.floor(Math.random() * candidates.length)]
  if (!area || !pitch) return
  const width = Math.max(pitch, Math.floor(Math.min(area.width, 56 + Math.random() * 64) / pitch) * pitch)
  const height = 3 * pitch
  const x = area.left + Math.random() * Math.max(0, area.width - width) - screen.left
  const y = area.top + (.35 + Math.random() * .3) * area.height - screen.top - height / 2
  return {
    x: Math.floor(x / pitch) * pitch,
    y: Math.floor(y / pitch) * pitch,
    width,
    height,
  }
}

export default function LedWear({ emission }: { emission: RefObject<HTMLDivElement> }) {
  const pulse = useRef<SVGFEComponentTransferElement>(null)

  useEffect(() => {
    const board = emission.current
    const strip = pulse.current
    if (!board || !strip) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const channels = [...strip.children]
    let timer = 0

    const clear = () => {
      window.clearTimeout(timer)
      board.style.removeProperty('filter')
    }

    const schedule = (opening = false) => {
      if (motion.matches || document.hidden) return
      timer = window.setTimeout(() => {
        if (motion.matches || document.hidden) return
        const spot = pickSpot(board, opening)
        if (!spot) {
          schedule()
          return
        }
        for (const [name, value] of Object.entries(spot)) strip.setAttribute(name, String(value))
        const phases = opening || Math.random() < .55 ? [dropout, surge, dropout, surge] : [dropout, surge]

        const playPhase = (index: number) => {
          const phase = phases[index]
          if (!phase) {
            clear()
            schedule()
            return
          }
          phase.gain.forEach((gain, channel) => channels[channel].setAttribute('slope', String(gain)))
          timer = window.setTimeout(() => playPhase(index + 1), phase.duration)
        }

        board.style.filter = `url(#${pulseFilter})`
        playPhase(0)
      }, opening ? 420 + Math.random() * 330 : 1150 + Math.random() * 2450)
    }

    const sync = () => {
      clear()
      schedule(true)
    }

    schedule(true)
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
        {/* Change the existing emission only within the selected strip. */}
        <feComponentTransfer ref={pulse} in="SourceGraphic" result="strip">
          <feFuncR type="linear" />
          <feFuncG type="linear" />
          <feFuncB type="linear" />
        </feComponentTransfer>
        <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="strip" /></feMerge>
      </filter>
    </svg>
  </div>
}
