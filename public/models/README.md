# Connected Realms — web trial

Source: `三境连通_Connected_Realms.blend`, including the September 8 glass, vinyl display, bookcase, wall art and plant revisions.

The GLB contains the chapel, study, bar and connecting stairs. Static lighting and procedural materials are baked into four atlases; plants retain their alpha-cutout textures. Geometry uses Draco compression. The original Blender file is not changed by export.

Rebuild from the repository root:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --disable-autoexec /path/to/三境连通_Connected_Realms.blend --python scripts/export-connected-realms.py -- "$PWD/public/models"
node scripts/check-connected-realms.mjs
npm run build
```

Export requires Blender with Cycles Metal support. This trial uses a fixed camera route with drag-to-look, not free walking. Baked lighting does not respond to moving objects; reflections, transparent glass and very fine details differ from the Cycles render.

Plant assets: [Potted Plant 01](https://polyhaven.com/a/potted_plant_01) and [Potted Plant 02](https://polyhaven.com/a/potted_plant_02), Poly Haven, CC0. Draco decoder is copied from the existing Three.js dependency and distributed under Apache 2.0; see `draco/LICENSE`.
