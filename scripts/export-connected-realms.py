"""Run with Blender --background SOURCE.blend --python this.py -- OUTPUT_DIRECTORY.
Creates a web-only copy; never saves changes to the source blend.
"""
import bpy, math, sys, json
from pathlib import Path
from mathutils import Vector
out=Path(sys.argv[sys.argv.index('--')+1]); out.mkdir(parents=True,exist_ok=True)
s=bpy.context.scene
s.render.engine='CYCLES'; s.cycles.samples=32; s.cycles.use_denoising=True
prefs=bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type='METAL'; prefs.get_devices()
for d in prefs.devices: d.use=d.type=='METAL'
s.cycles.device='GPU'
s.render.bake.margin=8
s.render.bake.use_pass_direct=True; s.render.bake.use_pass_indirect=True; s.render.bake.use_pass_color=True
# Preserve generated coordinates before joining objects for a small number of draw calls.
dg=bpy.context.evaluated_depsgraph_get()
groups={}
cutouts=[]
for collection in list(s.collection.children)[:4]:
 meshes=[]
 for o in list(collection.all_objects):
  if o.hide_render or o.type not in {'MESH','CURVE','FONT','SURFACE'}: continue
  if any(m and m.use_nodes and any(n.type=='OUTPUT_MATERIAL' and n.inputs['Volume'].is_linked and not n.inputs['Surface'].is_linked for n in m.node_tree.nodes) for m in o.data.materials):
   o.hide_render=True; continue
  ev=o.evaluated_get(dg); mesh=bpy.data.meshes.new_from_object(ev,depsgraph=dg)
  if not mesh.polygons: continue
  copy=bpy.data.objects.new(o.name+' web',mesh); s.collection.objects.link(copy); copy.matrix_world=o.matrix_world
  o.hide_render=True
  if any(m and m.use_nodes and any(n.type=='BSDF_PRINCIPLED' and n.inputs['Alpha'].is_linked for n in m.node_tree.nodes) for m in mesh.materials):
   cutouts.append(copy); continue
  # Generated coordinates become an explicit point attribute, so the wood grain survives joining.
  attr=mesh.attributes.new('web_generated','FLOAT_VECTOR','POINT')
  lower=Vector([min(v.co[i] for v in mesh.vertices) for i in range(3)])
  upper=Vector([max(v.co[i] for v in mesh.vertices) for i in range(3)])
  for v,a in zip(mesh.vertices,attr.data): a.vector=tuple((v.co[i]-lower[i])/max(upper[i]-lower[i],1e-8) for i in range(3))
  meshes.append(copy)
 bpy.ops.object.select_all(action='DESELECT')
 for o in meshes: o.select_set(True)
 bpy.context.view_layer.objects.active=meshes[0]; bpy.ops.object.join(); obj=bpy.context.object
 obj.name=collection.name
 # Decimate dense organic / bevel geometry; room structure remains planar.
 if len(obj.data.polygons)>100000:
  dec=obj.modifiers.new('Web triangle budget','DECIMATE'); dec.ratio=.4
  bpy.ops.object.modifier_apply(modifier=dec.name)
 obj.data.uv_layers.new(name='BakedUV'); obj.data.uv_layers.active_index=len(obj.data.uv_layers)-1
 bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
 bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.0005)
 bpy.ops.object.mode_set(mode='OBJECT')
 groups[collection.name]=obj
 print('PREPARED',obj.name,len(obj.data.polygons),flush=True)
# Route procedural Generated coordinates to the preserved attribute.
for mat in list(bpy.data.materials):
 if not mat.use_nodes: continue
 nodes,links=mat.node_tree.nodes,mat.node_tree.links
 attr=nodes.new('ShaderNodeAttribute'); attr.attribute_name='web_generated'
 for n in list(nodes):
  if n.type=='TEX_COORD':
   for link in list(n.outputs['Generated'].links): links.new(attr.outputs['Vector'],link.to_socket)
  if n.type in {'TEX_NOISE','TEX_VORONOI','TEX_WAVE'} and not n.inputs['Vector'].is_linked: links.new(attr.outputs['Vector'],n.inputs['Vector'])
# Soft fill is baked along with all existing scene lights.
for name,pos,target,energy,size in [('study',(0,1,4),(0,1,.1),160,4),('bar',(22,0,-.8),(22,0,-4),130,5),('chapel',(3.54,18.2,8),(3.54,20,3.2),450,7)]:
 data=bpy.data.lights.new('Web fill '+name,'AREA'); data.energy=energy; data.shape='DISK'; data.size=size; data.color=(1,.8,.6)
 o=bpy.data.objects.new(data.name,data); s.collection.objects.link(o); o.location=pos; o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
images={}
for index,(name,obj) in enumerate(groups.items()):
 bpy.ops.object.select_all(action='DESELECT'); obj.select_set(True); bpy.context.view_layer.objects.active=obj
 image=bpy.data.images.new('Baked '+name,width=4096 if index<3 else 2048,height=4096 if index<3 else 2048)
 # Each material gets its own copy so a later bake never changes another atlas target.
 for slot in obj.material_slots:
  if slot.material is None: slot.material=bpy.data.materials.new('Unpainted')
  slot.material=slot.material.copy(); slot.material.use_nodes=True
  node=slot.material.node_tree.nodes.new('ShaderNodeTexImage'); node.image=image; slot.material.node_tree.nodes.active=node
 bpy.ops.object.bake(type='COMBINED')
 image.filepath_raw=str(out/f'lightmap-{index}.jpg'); image.file_format='JPEG'; image.save()
 images[name]=image
 print('BAKED',name,flush=True)
# All baking finishes before replacing materials, preserving inter-room light bounce.
for name,obj in groups.items():
 mat=bpy.data.materials.new('Baked '+name); mat.use_nodes=True; nodes=mat.node_tree.nodes; nodes.clear()
 tex=nodes.new('ShaderNodeTexImage'); tex.image=images[name]
 uv=nodes.new('ShaderNodeUVMap'); uv.uv_map='BakedUV'
 emission=nodes.new('ShaderNodeEmission'); output=nodes.new('ShaderNodeOutputMaterial')
 mat.node_tree.links.new(uv.outputs[0],tex.inputs['Vector']); mat.node_tree.links.new(tex.outputs['Color'],emission.inputs['Color']); mat.node_tree.links.new(emission.outputs[0],output.inputs['Surface'])
 obj.data.materials.clear(); obj.data.materials.append(mat)
 for p in obj.data.polygons: p.material_index=0
 # Remove other UVs now the baked texture is the complete appearance.
 for layer in list(obj.data.uv_layers):
  if layer.name!='BakedUV': obj.data.uv_layers.remove(layer)
bpy.ops.object.select_all(action='DESELECT')
for o in [*groups.values(),*cutouts]: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out/'connected-realms.glb'),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False,export_image_format='JPEG',export_jpeg_quality=88,export_texcoords=True,export_normals=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)
for image in images.values(): Path(image.filepath_raw).unlink()
print('EXPORT_COMPLETE',flush=True)
