import { useCallback, useEffect, useRef, useState } from 'react'
import { VinylRecord } from '@phosphor-icons/react'
import type { Language } from '../lib/books'

const DEFAULT_AUDIO_SOURCE = '/audio/isnt-she-lovely.mp3'

type Props = {
  language: Language
  toggleSignal: number
  onPlayingChange: (playing: boolean) => void
  source?: string
  artist?: string
  title?: string
  variant?: 'earth' | 'heaven' | 'hell'
}

function createImpulse(context: AudioContext, duration: number, decay: number) {
  const length = Math.floor(context.sampleRate * duration)
  const impulse = context.createBuffer(2, length, context.sampleRate)

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel)
    for (let index = 0; index < length; index += 1) {
      const envelope = Math.pow(1 - index / length, decay)
      const earlyReflection = index < context.sampleRate * 0.22 ? 1.18 : 1
      data[index] = (Math.random() * 2 - 1) * envelope * earlyReflection
    }
  }

  return impulse
}

export default function SoulPlayer({
  language,
  toggleSignal,
  onPlayingChange,
  source = DEFAULT_AUDIO_SOURCE,
  artist = 'Stevie Wonder',
  title = 'Isn’t She Lovely',
  variant = 'earth',
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const playbackIntentRef = useRef(0)
  const playbackStateRef = useRef(false)
  const handledToggleRef = useRef(toggleSignal)
  const [isPlaying, setIsPlaying] = useState(false)

  const ensureAudioGraph = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!contextRef.current) {
      const context = new AudioContext()
      const source = context.createMediaElementSource(audio)
      const analyser = context.createAnalyser()
      const dry = context.createGain()
      const preDelay = context.createDelay(0.3)
      const warmth = context.createBiquadFilter()
      const convolver = context.createConvolver()
      const wet = context.createGain()

      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.9
      const isHeaven = variant === 'heaven'
      const isHell = variant === 'hell'
      dry.gain.value = isHeaven ? 0.82 : isHell ? 0.8 : 0.76
      preDelay.delayTime.value = isHeaven ? 0.046 : isHell ? 0.055 : 0.072
      warmth.type = 'lowpass'
      warmth.frequency.value = isHeaven ? 6200 : isHell ? 4300 : 3600
      warmth.Q.value = isHeaven ? 0.32 : isHell ? 0.4 : 0.48
      convolver.buffer = createImpulse(context, isHeaven ? 5.8 : isHell ? 4.2 : 4.8, isHeaven ? 2.7 : isHell ? 2.5 : 2.35)
      wet.gain.value = isHeaven ? 0.27 : isHell ? 0.29 : 0.34

      source.connect(analyser)
      analyser.connect(dry)
      dry.connect(context.destination)
      analyser.connect(preDelay)
      preDelay.connect(warmth)
      warmth.connect(convolver)
      convolver.connect(wet)
      wet.connect(context.destination)

      contextRef.current = context
      analyserRef.current = analyser
    }

    if (contextRef.current.state === 'suspended') await contextRef.current.resume()
  }, [variant])

  const updatePlaying = useCallback((playing: boolean) => {
    playbackStateRef.current = playing
    setIsPlaying(playing)
  }, [])

  const pausePlayback = useCallback(() => {
    playbackIntentRef.current += 1
    audioRef.current?.pause()
    updatePlaying(false)
  }, [updatePlaying])

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    const intent = playbackIntentRef.current + 1
    playbackIntentRef.current = intent
    updatePlaying(true)

    try {
      await ensureAudioGraph()
      await audio.play()
      if (playbackIntentRef.current !== intent) audio.pause()
    } catch {
      if (playbackIntentRef.current === intent) updatePlaying(false)
    }
  }, [ensureAudioGraph, updatePlaying])

  const togglePlayback = useCallback(() => {
    if (playbackStateRef.current) pausePlayback()
    else void startPlayback()
  }, [pausePlayback, startPlayback])

  useEffect(() => {
    if (handledToggleRef.current === toggleSignal) return
    handledToggleRef.current = toggleSignal
    togglePlayback()
  }, [togglePlayback, toggleSignal])

  useEffect(() => {
    onPlayingChange(isPlaying)
  }, [isPlaying, onPlayingChange])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const frequencyData = new Uint8Array(128)
    const easedBands = new Float32Array(4)
    let animationFrame = 0

    const draw = (time = 0) => {
      const bounds = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const pixelWidth = Math.max(1, Math.floor(bounds.width * ratio))
      const pixelHeight = Math.max(1, Math.floor(bounds.height * ratio))
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, bounds.width, bounds.height)
      if (isPlaying) analyserRef.current?.getByteFrequencyData(frequencyData)

      const bandRanges = [[1, 9], [7, 20], [18, 43], [38, 82]] as const
      bandRanges.forEach(([start, end], index) => {
        let sum = 0
        for (let bin = start; bin < end; bin += 1) sum += frequencyData[bin]
        const measured = isPlaying ? sum / ((end - start) * 255) : 0
        const release = isPlaying ? 0.925 - index * 0.012 : 0.86
        easedBands[index] = Math.max(measured, easedBands[index] * release)
      })

      const originX = -38
      const originY = -10
      const endX = bounds.width + 8
      const groovePoints: Array<{
        startX: number
        startY: number
        control1X: number
        control1Y: number
        control2X: number
        control2Y: number
        endX: number
        endY: number
      }> = []

      for (let groove = 0; groove < 4; groove += 1) {
        const energy = easedBands[groove]
        const breathing = isPlaying && !reducedMotion ? Math.sin(time * 0.0011 + groove * 0.72) * 1.6 : 0
        const sag = 19 + groove * 8 + energy * (7 - groove * 0.7) + breathing
        const endY = 15 + groove * 5 + energy * 2.4
        const points = {
          startX: originX,
          startY: originY + groove * 1.35,
          control1X: bounds.width * 0.1,
          control1Y: sag,
          control2X: bounds.width * 0.43,
          control2Y: sag + 12 + groove * 1.5,
          endX,
          endY,
        }
        groovePoints.push(points)

        context.beginPath()
        context.moveTo(points.startX, points.startY)
        context.bezierCurveTo(
          points.control1X,
          points.control1Y,
          points.control2X,
          points.control2Y,
          points.endX,
          points.endY,
        )
        context.lineWidth = groove === 0 ? 0.9 : 0.72
        context.lineCap = 'round'
        context.strokeStyle = variant === 'heaven'
          ? `rgba(250,224,176,${isPlaying ? 0.2 + energy * 0.26 : 0.1})`
          : variant === 'hell'
            ? `rgba(209,132,76,${isPlaying ? 0.22 + energy * 0.28 : 0.1})`
            : `rgba(214,192,153,${isPlaying ? 0.22 + energy * 0.24 : 0.12})`
        context.shadowBlur = isPlaying ? 3 + energy * 5 : 0
        context.shadowColor = variant === 'heaven'
          ? 'rgba(255,224,166,.34)'
          : variant === 'hell'
            ? 'rgba(169,64,37,.42)'
            : 'rgba(210,155,88,.28)'
        context.stroke()
      }

      const pointCount = 6
      for (let index = 0; index < pointCount; index += 1) {
        const groove = index % groovePoints.length
        const curve = groovePoints[groove]
        const motion = isPlaying && !reducedMotion ? (time * (0.000026 + groove * 0.0000025)) % 0.76 : 0
        const progress = 0.16 + ((index * 0.137 + motion) % 0.78)
        const inverse = 1 - progress
        const x = inverse ** 3 * curve.startX
          + 3 * inverse ** 2 * progress * curve.control1X
          + 3 * inverse * progress ** 2 * curve.control2X
          + progress ** 3 * curve.endX
        const y = inverse ** 3 * curve.startY
          + 3 * inverse ** 2 * progress * curve.control1Y
          + 3 * inverse * progress ** 2 * curve.control2Y
          + progress ** 3 * curve.endY
        const energy = easedBands[groove]
        const radius = 0.7 + energy * 1.15

        context.beginPath()
        context.arc(x, y, radius, 0, Math.PI * 2)
        context.fillStyle = variant === 'heaven'
          ? (index % 3 === 1
              ? `rgba(255,214,142,${isPlaying ? 0.34 + energy * 0.42 : 0.07})`
              : `rgba(255,247,221,${isPlaying ? 0.4 + energy * 0.44 : 0.09})`)
          : variant === 'hell'
            ? (index % 3 === 1
                ? `rgba(170,66,43,${isPlaying ? 0.4 + energy * 0.46 : 0.07})`
                : `rgba(240,183,112,${isPlaying ? 0.44 + energy * 0.44 : 0.08})`)
            : (index % 3 === 1
              ? `rgba(123,192,208,${isPlaying ? 0.38 + energy * 0.48 : 0.08})`
              : `rgba(242,224,190,${isPlaying ? 0.44 + energy * 0.46 : 0.1})`)
        context.shadowBlur = isPlaying ? 7 + energy * 9 : 0
        context.shadowColor = variant === 'heaven'
          ? (index % 3 === 1 ? 'rgba(255,207,127,.52)' : 'rgba(255,244,216,.52)')
          : variant === 'hell'
            ? (index % 3 === 1 ? 'rgba(155,52,34,.58)' : 'rgba(234,164,86,.52)')
            : (index % 3 === 1 ? 'rgba(123,192,208,.58)' : 'rgba(242,224,190,.5)')
        context.fill()
      }

      context.shadowBlur = 0

      if (!reducedMotion) animationFrame = requestAnimationFrame(draw)
    }

    draw(0)
    return () => cancelAnimationFrame(animationFrame)
  }, [isPlaying, variant])

  useEffect(() => () => {
    audioRef.current?.pause()
    void contextRef.current?.close()
    onPlayingChange(false)
  }, [onPlayingChange])

  return (
    <div className={`now-playing now-playing-${variant}${isPlaying ? ' is-playing' : ''}`} aria-live="polite">
      <audio ref={audioRef} src={source} preload="none" onEnded={pausePlayback} />
      <VinylRecord size={34} weight="thin" aria-hidden="true" />
      <div className="now-playing-copy">
        <span>{isPlaying
          ? (language === 'zh' ? '正在播放' : 'Now playing')
          : (language === 'zh' ? '唱片已就绪' : 'Record ready')}</span>
        <strong>{artist} · {title}</strong>
        <canvas ref={canvasRef} className="now-playing-grooves" aria-hidden="true" />
      </div>
    </div>
  )
}
