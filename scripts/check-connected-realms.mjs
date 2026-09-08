import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'

const bytes = readFileSync(new URL('../public/models/connected-realms.glb', import.meta.url))
assert.equal(bytes.toString('utf8', 0, 4), 'glTF')
assert.equal(bytes.readUInt32LE(4), 2)
assert.equal(bytes.readUInt32LE(8), bytes.length)
const gltf = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)))
for (const name of ['Heaven', 'Earth', 'Hell', 'Connections']) {
  assert(gltf.nodes.some(node => node.name.includes(name)), `${name} is missing`)
  const material = gltf.materials.find(material => material.name.startsWith('Baked ') && material.name.includes(name))
  assert(material?.emissiveTexture, `${name} has no baked lighting`)
}
assert(gltf.extensionsUsed.includes('KHR_draco_mesh_compression'))
assert(gltf.images.every(image => image.bufferView !== undefined), 'Textures must be embedded')
assert(bytes.length < 32 * 1024 * 1024, 'Model exceeds the 32 MB trial budget')
assert(statSync(new URL('../public/models/draco/draco_decoder.wasm', import.meta.url)).size > 0)
const source = readFileSync(new URL('../src/components/ConnectedRealms.tsx', import.meta.url), 'utf8')
const stops = JSON.parse(source.match(/const stops = (\[[\s\S]*?\]) as const/)[1].replace(/,\s*]/g, ']'))
assert.equal(stops[0][0], 0); assert.equal(stops.at(-1)[0], 1)
for (let i = 1; i < stops.length; i++) assert(stops[i][0] > stops[i - 1][0], 'Camera path times must increase')
console.log(`PASS: four connected spaces, embedded baked textures, Draco decoder, ordered camera path; ${(bytes.length / 1048576).toFixed(1)} MB, ${gltf.meshes.length} meshes.`)
