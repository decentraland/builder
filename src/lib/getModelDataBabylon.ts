import {
  BoundingInfo,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Mesh,
  Scene,
  SceneLoader,
  SpotLight,
  Tools,
  Vector3
} from '@babylonjs/core'
import future from 'fp-future'
import { ModelMetrics } from 'modules/scene/types'

// transparent 1x1 pixel
export const TRANSPARENT_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNiYAAAAAkAAxkR2eQAAAAASUVORK5CYII='

export enum ThumbnailType {
  DEFAULT = 'default',
  TOP = 'top',
  FRONT = 'front'
}

type Options = {
  width: number
  height: number
  mappings?: Record<string, string>
  thumbnailType: ThumbnailType
}

const defaults: Options = {
  width: 512,
  height: 512,
  thumbnailType: ThumbnailType.DEFAULT
}

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

export async function getModelDataBabylon(url: string, options: Partial<Options> = {}) {
  // add defaults to options
  const { width, height, mappings, thumbnailType } = {
    ...defaults,
    ...options
  }
  console.log('url', url)
  console.log('mappings', mappings)
  console.log('thumbnailType', thumbnailType)

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

  // TODO: configure mappings

  try {
    // Load GLTF
    let scene = new Scene(engine)
    scene.autoClear = true
    scene.clearColor = new Color4(0, 0, 0, 0)
    const loadModel = future<Scene>()
    SceneLoader.Append(url, '', scene, scene => scene.onReadyObservable.addOnce(() => loadModel.resolve(scene)), null, null, '.glb')
    scene = await loadModel
    scene.getBoundingBoxRenderer().frontColor = Color3.Red()
    scene.getBoundingBoxRenderer().backColor = Color3.Yellow()

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
    parent.showBoundingBox = true

    // render
    const render = future<string>()
    Tools.CreateScreenshotUsingRenderTarget(engine, scene.activeCamera!, 1024, data => render.resolve(data), undefined, undefined, true)
    const image = await render

    // remove dom element
    document.body.removeChild(canvas)

    // return data
    const info: ModelMetrics = {
      triangles: 0,
      materials: 0,
      textures: 0,
      meshes: 0,
      bodies: 0,
      entities: 1
    }

    return { info, image }
  } catch (e) {
    // could not render model, default to 0 metrics and default thumnail
    const info: ModelMetrics = {
      triangles: 0,
      materials: 0,
      textures: 0,
      meshes: 0,
      bodies: 0,
      entities: 1
    }
    const image = TRANSPARENT_PIXEL
    return { info, image }
  }
}
