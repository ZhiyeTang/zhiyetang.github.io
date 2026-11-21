import { useEffect, useRef, useState } from 'react'
import { CaretDown, Pause, Play, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import { contact, education, experience, personalInfo } from '../data'
import recordSelections from '../data/records.json'
import type { Language } from '../i18n/LanguageContext'
import { books, type BookKey, type MarkdownBlock } from '../lib/books'
import { paintVgaImage } from '../lib/ledDisplay'
import { MarkdownBlockView } from './MarkdownBlockView'

export const sections = ['intro', 'experience', 'research', 'life', 'essays', 'contact'] as const
export type PortfolioSection = typeof sections[number]

const featuredOrder: Record<string, number> = { 'brown-sugar': 0, 'songs-in-the-key-of-life': 1 }
const records = [...recordSelections].sort((a, b) =>
  (featuredOrder[a.id] ?? 2) - (featuredOrder[b.id] ?? 2),
)
const schools = [...education].sort((a, b) => b.period.localeCompare(a.period))

const tracks = [
  { title: 'Isn’t She Lovely', artist: 'Stevie Wonder', source: '/audio/isnt-she-lovely.mp3' },
  { title: 'Touching God', artist: 'Daniel Caesar', source: '/audio/touching-god.mp3' },
  { title: 'Really Love', artist: 'D’Angelo', source: '/audio/really-love.mp3' },
]

const copy = {
  zh: {
    intro: '我研究如何让手机理解影像。工作之外，喜欢灵魂乐和放克，也在这里写一点随笔。',
    about: '研究背景',
    research: '研究项目',
    work: '工作',
    education: '教育',
    patents: '专利',
    record: '选择唱片',
    next: '换一张唱片',
    rotation: '最近循环',
    play: '播放',
    pause: '暂停',
    seek: '播放进度',
    volume: '音量',
    mute: '静音',
    unmute: '取消静音',
    audioError: '音频加载失败，请重试。',
    contactTitle: '聊研究、产品，或一张唱片。',
    contactBody: '欢迎写信给我，也可以在下面找到我。',
  },
  en: {
    intro: 'I work on helping phones understand images. Outside work, I listen to soul and funk, and write the occasional essay.',
    about: 'Research background',
    research: 'Selected research',
    work: 'Work',
    education: 'Education',
    patents: 'Patents',
    record: 'Choose a record',
    next: 'Next record',
    rotation: 'In rotation',
    play: 'Play',
    pause: 'Pause',
    seek: 'Playback position',
    volume: 'Volume',
    mute: 'Mute',
    unmute: 'Unmute',
    audioError: 'The track could not load. Try playing it again.',
    contactTitle: 'Research, products, or one more record.',
    contactBody: 'Feel free to write, or find me at the links below.',
  },
}

export function LedImage({ src, alt, portrait = false }: { src: string; alt: string; portrait?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [painted, setPainted] = useState('')
  const ready = painted === src

  return <figure className={'portfolio-art' + (portrait ? ' portfolio-portrait' : '')}>
    <img
      src={src}
      alt={alt}
      hidden={ready}
      onLoad={event => {
        if (canvas.current && paintVgaImage(canvas.current, event.currentTarget, portrait)) setPainted(src)
      }}
    />
    <canvas ref={canvas} width={176} height={176} role="img" aria-label={alt} hidden={!ready} />
  </figure>
}

export function PortfolioIntro({ language }: { language: Language }) {
  return <div className="portfolio-content portfolio-intro">
    <h2>{personalInfo.title[language]}</h2>
    <p>{copy[language].intro}</p>
  </div>
}

function Blocks({ blocks }: { blocks: MarkdownBlock[] }) {
  return blocks.map((block, i) => <MarkdownBlockView key={i} block={block} />)
}

function Reading({ book, language }: { book: BookKey; language: Language }) {
  const pages = books[language][book]
  return pages.map((page, index) => index % 2 === 0 && (
    <div className="portfolio-pair" key={page.title}>
      {pages.slice(index, index + 2).map(entry => (
        <article className="portfolio-reading" key={entry.title}>
          <Blocks blocks={entry.blocks} />
        </article>
      ))}
    </div>
  ))
}

function timeLabel(time: number) {
  const seconds = Math.floor(time)
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
}

function Listening({ language }: { language: Language }) {
  const t = copy[language]
  const player = useRef<HTMLAudioElement>(null)
  const [trackIndex, selectTrack] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const audio = player.current
    return () => {
      audio?.pause()
    }
  }, [])

  function toggleTrack(index: number) {
    const audio = player.current
    if (!audio) return
    if (index === trackIndex && !audio.paused) {
      audio.pause()
      return
    }
    setFailed(false)
    if (index !== trackIndex || failed) {
      selectTrack(index)
      setPosition(0)
      setDuration(0)
      audio.src = tracks[index].source
    }
    const source = audio.src
    void audio.play().catch(error => {
      if (player.current === audio && audio.src === source && error.name !== 'AbortError') setFailed(true)
    })
  }

  return <section className="portfolio-listening">
    <h2>{t.rotation}</h2>
    <audio
      ref={player}
      preload="none"
      hidden
      muted={muted}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onEnded={() => setPlaying(false)}
      onError={() => setFailed(true)}
      onLoadedMetadata={event => {
        const length = event.currentTarget.duration
        setDuration(Number.isFinite(length) ? length : 0)
      }}
      onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}
    />
    {tracks.map((track, index) => {
      const active = trackIndex === index
      const isPlaying = active && playing
      return <div className="portfolio-track" key={track.source}>
        <button className="portfolio-icon-button" type="button" aria-label={(isPlaying ? t.pause : t.play) + ' ' + track.title} onClick={() => toggleTrack(index)}>
          {isPlaying ? <Pause weight="fill" aria-hidden="true" /> : <Play weight="fill" aria-hidden="true" />}
        </button>
        <div><h3>{track.title}</h3><p>{track.artist}</p></div>
        {active && duration > 0 && <div className="portfolio-seek">
          <span aria-hidden="true">{timeLabel(position)}</span>
          <input
            className="portfolio-range"
            type="range" min="0" max={duration} step=".1" value={Math.min(position, duration)}
            aria-label={t.seek}
            aria-valuetext={timeLabel(position) + ' / ' + timeLabel(duration)}
            onChange={event => {
              const time = event.currentTarget.valueAsNumber
              if (player.current) player.current.currentTime = time
              setPosition(time)
            }}
          />
          <span aria-hidden="true">{timeLabel(duration)}</span>
          <button className="portfolio-icon-button" type="button" aria-label={muted ? t.unmute : t.mute} onClick={() => setMuted(!muted)}>
            {muted ? <SpeakerSlash aria-hidden="true" /> : <SpeakerHigh aria-hidden="true" />}
          </button>
          <input
            className="portfolio-range"
            type="range" min="0" max="1" step=".05" value={volume}
            aria-label={t.volume}
            aria-valuetext={Math.round(volume * 100) + '%'}
            onChange={event => {
              const audio = player.current
              if (!audio) return
              audio.volume = event.currentTarget.valueAsNumber
              setVolume(audio.volume)
              if (audio.volume > 0) setMuted(false)
            }}
          />
        </div>}
        {active && failed && <p className="portfolio-audio-error" role="status">{t.audioError}</p>}
      </div>
    })}
  </section>
}

type Props = {
  section: PortfolioSection
  language: Language
  recordIndex: number
  onRecordChange: (index: number) => void
}

export default function PortfolioContent({ section, language, recordIndex, onRecordChange }: Props) {
  const t = copy[language]

  switch (section) {
    case 'intro': {
      const research = books[language].research.slice(0, 3)

      return <div className="portfolio-overview">
        <div className="portfolio-highlights">
          <h2><a href="#research">{t.research}</a></h2>
          <ul>{research.map(page => <li key={page.title}>{page.title}</li>)}</ul>
        </div>
        <section className="portfolio-background">
          <h2>{t.about}</h2>
          <MarkdownBlockView block={{ type: 'paragraph', content: personalInfo.bio[language] }} />
        </section>
      </div>
    }

    case 'experience':
      return <div className="portfolio-pair portfolio-experience">
        <section>
          <h2>{t.work}</h2>
          <dl className="portfolio-timeline">
            {experience.map((entry, index) => <div key={entry.period}>
              <dt>{language === 'zh' ? entry.period.replace('Present', '至今') : entry.period}</dt>
              <dd>
                <h3>{entry.company[language]}</h3>
                <p>{entry.role[language]}</p>
                {index === 0 && books[language].work.map((page, i) => (
                  <Blocks key={i} blocks={page.blocks.filter(block => block.type === 'paragraph' && !block.content.startsWith('*'))} />
                ))}
              </dd>
            </div>)}
          </dl>
        </section>
        <section>
          <h2>{t.education}</h2>
          <dl className="portfolio-timeline">
            {schools.map(entry => <div key={entry.period}>
              <dt>{entry.period}</dt>
              <dd><h3>{entry.school[language]}</h3><p>{entry.degree[language]}</p></dd>
            </div>)}
          </dl>
        </section>
      </div>

    case 'research':
      return <>
        <Reading book="research" language={language} />
        <div className="portfolio-reading-heading"><h2>{t.patents}</h2></div>
        <Reading book="patents" language={language} />
      </>

    case 'life': {
      const record = records[recordIndex]
      return <>
        <div className="portfolio-record">
          <LedImage src={record.image} alt={record.title + (language === 'zh' ? ' 点阵封面' : ' LED album cover')} />
          <div aria-live="polite">
            <h2>{record.title}</h2>
            <p className="portfolio-record-artist">{record.artist} · {record.year}</p>
            <p>{record.note[language]}</p>
          </div>
        </div>
        <div className="portfolio-record-controls">
          <details className="portfolio-record-picker">
            <summary>{t.record}<CaretDown size={14} aria-hidden="true" /></summary>
            <ul>
              {records.map((entry, index) => <li key={entry.id}>
                <button type="button" aria-pressed={index === recordIndex} onClick={event => {
                  const details = event.currentTarget.closest('details')
                  if (details) details.open = false
                  onRecordChange(index)
                }}>{entry.title}</button>
              </li>)}
            </ul>
          </details>
          <button className="portfolio-action" type="button" onClick={() => onRecordChange((recordIndex + 1) % records.length)}>{t.next}</button>
        </div>
        <Listening language={language} />
      </>
    }

    case 'essays':
      return null

    case 'contact':
      return <>
        <h2>{t.contactTitle}</h2>
        <p>{t.contactBody}</p>
        <address className="portfolio-contact">
          <a href={'mailto:' + contact.email}>{contact.email}</a>
          <a href={contact.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        </address>
      </>
  }
}
