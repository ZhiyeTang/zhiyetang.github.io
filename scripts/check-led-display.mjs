import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/lib/ledDisplay.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
})
const { vgaColors, paintVgaImage } = await import(
  'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64')
)

assert.equal(vgaColors.length, 256)
assert(vgaColors.every(color => /^#[0-9a-f]{6}$/.test(color)))
assert.deepEqual([vgaColors[0], vgaColors[6], vgaColors[32], vgaColors[76], vgaColors[80], vgaColors[255]],
  ['#000000', '#aa5500', '#0000ff', '#7dffff', '#b6b6ff', '#000000'])
const pixels = { data: new Uint8ClampedArray([0, 0, 0, 255, 246, 3, 1, 255, 123, 246, 249, 255, 255, 255, 255, 255]) }
let drawn = false
let imageBounds
const canvas = { width: 2, height: 2, getContext: () => ({
  clearRect() {},
  drawImage(_image, ...bounds) { imageBounds = bounds },
  getImageData: () => pixels,
  putImageData: () => { drawn = true },
}) }
assert(paintVgaImage(canvas, { naturalWidth: 2, naturalHeight: 2 }, true))
assert.deepEqual(imageBounds, [0, 0, 2, 2])
assert(drawn)
for (let i = 0; i < pixels.data.length; i += 4) {
  const color = '#' + [...pixels.data.slice(i, i + 3)].map(value => value.toString(16).padStart(2, '0')).join('')
  assert(vgaColors.includes(color))
  assert.equal(pixels.data[i + 3], 255)
}
const wideImage = { naturalWidth: 4, naturalHeight: 2 }
assert(paintVgaImage(canvas, wideImage, true))
assert.deepEqual(imageBounds, [0, .5, 2, 1])
assert(paintVgaImage(canvas, wideImage, false))
assert.deepEqual(imageBounds, [-1, 0, 4, 2])
console.log('PASS: VGA palette, indexed color, and portrait and cover sizing')
