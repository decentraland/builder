import {
  BoundingInfo,
  Camera,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Mesh,
  Scene,
  SceneLoader,
  SpotLight,
  TargetCamera,
  Tools,
  Vector3
} from '@babylonjs/core'
import '@babylonjs/loaders'
import future from 'fp-future'
import { defaults, Options, ThumbnailType } from './getModelData'

function refreshBoundingInfo(parent: Mesh) {
  var children = parent.getChildren().filter(mesh => mesh.id !== '__root__')
  console.log(
    children,
    children.map(child => child.id)
  )
  if (children.length > 0) {
    const child = children[0] as Mesh
    var boundingInfo = child.getBoundingInfo()
    var min = boundingInfo.minimum.add(child.position)
    var max = boundingInfo.maximum.add(child.position)
    for (var i = 1; i < children.length; i++) {
      const child = children[i] as Mesh
      boundingInfo = child.getBoundingInfo()
      min = Vector3.Minimize(min, boundingInfo.minimum.add(child.position))
      max = Vector3.Maximize(max, boundingInfo.maximum.add(child.position))
    }
    parent.setBoundingInfo(new BoundingInfo(min, max))
  }
}

export async function getScreenshot(url: string, options: Partial<Options> = {}) {
  // add defaults to options
  const { width, height, extension, thumbnailType } = {
    ...defaults,
    ...options
  }

  // setup renderer
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.style.visibility = 'hidden'
  document.body.appendChild(canvas)
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true
  })

  // Load GLTF
  const root = new Scene(engine)
  root.autoClear = true
  root.clearColor = new Color4(0, 0, 0, 0)
  const loadModel = future<Scene>()
  SceneLoader.Append(url, '', root, scene => scene.onReadyObservable.addOnce(() => loadModel.resolve(scene)), null, null, '.' + extension)
  const scene = await loadModel

  // Setup Camera
  var camera = new TargetCamera('targetCamera', new Vector3(0, 0, 0), scene)
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA
  camera.orthoTop = 1
  camera.orthoBottom = -1
  camera.orthoLeft = -1
  camera.orthoRight = 1

  switch (thumbnailType) {
    case ThumbnailType.FRONT: {
      camera.position = new Vector3(0, 0, 2)
      break
    }
    case ThumbnailType.TOP: {
      camera.position = new Vector3(0, 1, 0)
      break
    }
    default:
      camera.position = new Vector3(-2, 2, 2)
  }

  camera.setTarget(Vector3.Zero())
  camera.attachControl(canvas, true)

  // Setup lights
  var directional = new DirectionalLight('directional', new Vector3(0, 0, -1), scene)
  directional.intensity = 2
  var hemispherical = new HemisphericLight('hemispherical', new Vector3(0, 1, 0), scene)
  hemispherical.intensity = 1
  var spot = new SpotLight('spot', new Vector3(-2, 2, 2), new Vector3(2, -2, -2), Math.PI / 2, 1000, scene)
  spot.intensity = 2

  // Setup parent
  var parent = new Mesh('parent', scene)
  for (const mesh of scene.meshes) {
    if (mesh !== parent) {
      console.log(mesh.id)
      mesh.parent = parent
    }
  }

  // Clean up
  for (let material of scene.materials) {
    if (material.name.toLowerCase().includes('hair_mat')) {
      material.alpha = 0
      scene.removeMaterial(material)
    }
  }
  for (let texture of scene.textures) {
    if (texture.name.toLowerCase().includes('hair_mat')) {
      texture.dispose()
      scene.removeTexture(texture)
    }
  }

  // resize and center
  refreshBoundingInfo(parent)
  const size = parent.getBoundingInfo().boundingBox.extendSize.length()
  const normalized = new Vector3(1 / size, 1 / size, 1 / size)
  parent.scaling.multiplyInPlace(normalized)
  const center = parent.getBoundingInfo().boundingBox.center
  center.multiplyInPlace(normalized)
  parent.position.subtractInPlace(center)

  // render
  const render = future<string>()
  Tools.CreateScreenshotUsingRenderTarget(engine, camera, 1024, data => render.resolve(data), undefined, undefined, true)
  const image = await render

  // remove dom element
  document.body.removeChild(canvas)

  // return image
  return image
}
