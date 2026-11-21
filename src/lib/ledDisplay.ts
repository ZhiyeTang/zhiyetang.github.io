type RGB = [number, number, number]

// VGA Mode 13h starts with the CGA colors, then 16 grays and nine hue rings.
const cga = Array.from({ length: 16 }, (_, index) =>
  [4, 2, 1].map(bit => (index & 8 ? 21 : 0) + (index & bit ? 42 : 0)),
)
cga[6][1] = 21
const grays = [0, 5, 8, 11, 14, 17, 20, 24, 28, 32, 36, 40, 45, 50, 56, 63]
const rings = [
  [0, 16, 31, 47, 63], [31, 39, 47, 55, 63], [45, 49, 54, 58, 63],
  [0, 7, 14, 21, 28], [14, 17, 21, 24, 28], [20, 22, 24, 26, 28],
  [0, 4, 8, 12, 16], [8, 10, 12, 14, 16], [11, 12, 13, 15, 16],
].flatMap(steps => {
  const low = steps[0]
  const high = steps[4]
  const up = steps.slice(0, -1)
  const down = steps.slice(1).reverse()
  return [
    ...up.map(v => [v, low, high]), ...down.map(v => [high, low, v]),
    ...up.map(v => [high, v, low]), ...down.map(v => [v, high, low]),
    ...up.map(v => [low, high, v]), ...down.map(v => [low, v, high]),
  ]
})
const palette: RGB[] = [...cga, ...grays.map(v => [v, v, v]), ...rings, ...Array.from({ length: 8 }, () => [0, 0, 0])]
  .map(([r, g, b]) => [Math.round(r * 255 / 63), Math.round(g * 255 / 63), Math.round(b * 255 / 63)])
const hex = (values: number[]) => '#' + values.map(v => v.toString(16).padStart(2, '0')).join('')
export const vgaColors = palette.map(hex)
export const vgaTrack = 'linear-gradient(90deg, ' + vgaColors.map((color, index) =>
  color + ' ' + (100 * index / 256) + '% ' + (100 * (index + 1) / 256) + '%',
).join(', ') + ')'

export type LedSettings = { color: number; glow: number; aging: boolean }

const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

export function paintVgaImage(canvas: HTMLCanvasElement, image: HTMLImageElement, portrait: boolean) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx || !image.naturalWidth || !image.naturalHeight) return false

  const { width, height } = canvas
  const scaleX = width / image.naturalWidth
  const scaleY = height / image.naturalHeight
  const scale = portrait ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)

  const pixels = ctx.getImageData(0, 0, width, height)
  const cache = new Map<number, RGB>()
  for (let i = 0; i < width * height; i++) {
    const offset = (bayer[(Math.floor(i / width) % 4) * 4 + i % width % 4] - 7.5) * .9
    const pos = i * 4
    const r = Math.max(0, Math.min(63, Math.round((pixels.data[pos] + offset) / 4)))
    const g = Math.max(0, Math.min(63, Math.round((pixels.data[pos + 1] + offset) / 4)))
    const b = Math.max(0, Math.min(63, Math.round((pixels.data[pos + 2] + offset) / 4)))
    const key = (r * 64 + g) * 64 + b
    let match = cache.get(key)
    if (!match) {
      let closest = Infinity
      match = palette[0]
      for (const color of palette) {
        const distance = .27 * (r * 4 - color[0]) ** 2 + .58 * (g * 4 - color[1]) ** 2 + .15 * (b * 4 - color[2]) ** 2
        if (distance < closest) {
          closest = distance
          match = color
        }
      }
      cache.set(key, match)
    }
    pixels.data.set(match, pos)
  }
  ctx.putImageData(pixels, 0, 0)
  return true
}
