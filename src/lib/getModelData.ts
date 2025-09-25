import type { OrthographicCamera, Material, Object3D, AnimationClip } from 'three'
import { basename } from 'path'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { IPreviewController, WearableCategory } from '@dcl/schemas'
import { Metrics, ModelMetrics } from 'modules/models/types'
import { ItemType, THUMBNAIL_PATH } from 'modules/item/types'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from 'components/Modals/CreateSingleItemModal/utils'
import { isImageFile } from 'modules/item/utils'
import { convertImageIntoWearableThumbnail } from 'modules/media/utils'
import { EmoteAnimationsSyncError, EmoteWithMeshError } from 'modules/item/errors'
import { EMOTE_ERROR, getScreenshot } from './getScreenshot'

// transparent 1x1 pixel
export const TRANSPARENT_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNiYAAAAAkAAxkR2eQAAAAASUVORK5CYII='

export enum ThumbnailType {
  DEFAULT = 'default',
  TOP = 'top',
  FRONT = 'front'
}

export enum EngineType {
  THREE = 'three',
  BABYLON = 'babylon'
}

export type Options = {
  width: number
  height: number
  extension: string
  engine: EngineType
  thumbnailType: ThumbnailType
  mappings?: Record<string, string>
}

export const defaults: Options = {
  width: 1024,
  height: 1024,
  extension: '.glb',
  engine: EngineType.THREE,
  thumbnailType: ThumbnailType.DEFAULT
}

const ARMATURE_PREFIX = 'Armature'

enum ARMATURES {
  PROP = ARMATURE_PREFIX + '_Prop',
  OTHER = ARMATURE_PREFIX + '_Other'
}

async function loadGltf(url: string, options: Partial<Options> = {}) {
  const Three = await import('three')
  const { width, height, mappings } = {
    ...defaults,
    ...options
  }

  // setup renderer
  const renderer = new Three.WebGLRenderer({ alpha: true })
  renderer.setSize(width, height, false)
  renderer.domElement.style.visibility = 'hidden'
  document.body.appendChild(renderer.domElement)

  // configure mappings
  let manager
  if (mappings) {
    manager = new Three.LoadingManager()
    manager.setURLModifier(url => {
      const path = basename(new URL(url.replace('blob:', '')).pathname.slice(1))
      const key = Object.keys(mappings).find(key => key.endsWith(path))
      if (key) {
        return mappings[key]
      }

      return url
    })
  }
  const loader = new GLTFLoader(manager)
  return { renderer, gltf: await new Promise<GLTF>((resolve, reject) => loader.load(url, resolve, undefined, reject)) }
}

export async function getModelData(url: string, options: Partial<Options> = {}) {
  const Three = await import('three')
  // add defaults to options
  const { width, height, mappings, engine, thumbnailType } = {
    ...defaults,
    ...options
  }

  try {
    // load model
    const materials = new Set<string>()
    let bodies = 0
    let colliderTriangles = 0
    const { gltf, renderer } = await loadGltf(url, {
      width,
      height,
      mappings
    })

    gltf.scene.traverse(node => {
      if (node instanceof Three.Mesh) {
        bodies++
        if (node.material) {
          materials.add((node.material as Material).name)
        }
        if (node.name.includes('_collider')) {
          if (node.geometry instanceof Three.Geometry) {
            colliderTriangles += node.geometry.faces.length
          } else if (node.geometry instanceof Three.BufferGeometry) {
            const geometry = new Three.Geometry().fromBufferGeometry(node.geometry)
            colliderTriangles += geometry.faces.length
          }
          node.visible = false
        } else if (node.material instanceof Three.MeshStandardMaterial && node.material.name.toLowerCase().includes('hair_mat')) {
          node.visible = false
        }
      }
    })
    const root = gltf.scene

    // create scene
    const scene = new Three.Scene()
    scene.add(root)

    // center camera
    let camera: OrthographicCamera
    const size = new Three.Box3().setFromObject(root).getSize(new Three.Vector3()).length()
    root.scale.multiplyScalar(1 / size)
    const center = new Three.Box3().setFromObject(root).getCenter(new Three.Vector3())
    switch (thumbnailType) {
      case ThumbnailType.FRONT: {
        camera = new Three.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1000)
        camera.position.set(center.x + 0, center.y + 0, center.z + 1)
        break
      }
      case ThumbnailType.TOP: {
        camera = new Three.OrthographicCamera(-0.25, 0.25, 0.25, -0.25, 0, 1000)
        camera.position.set(center.x + 0, center.y + 1, center.z + 0)
        break
      }
      default: {
        camera = new Three.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1000)
        camera.position.set(center.x + 1, center.y + 1, center.z + 1)
        break
      }
    }
    camera.lookAt(center)
    camera.updateProjectionMatrix()

    // light
    const ambient = new Three.AmbientLight(0xffffff, 1.2)
    scene.add(ambient)

    switch (thumbnailType) {
      case ThumbnailType.FRONT: {
        const directional = new Three.DirectionalLight(0xffffff, 1)
        directional.position.set(center.x + 0, center.y + 1, center.z + 0)
        directional.lookAt(center)
        scene.add(directional)
        break
      }
      default: {
        const directional = new Three.DirectionalLight(0xffffff, 0.8)
        directional.position.set(center.x + 1, center.y + 1, center.z - 1)
        directional.lookAt(center)
        scene.add(directional)
        const rectarea = new Three.RectAreaLight(0xffffff, 0.5, width, height)
        rectarea.position.set(-3, 0, 0)
        rectarea.lookAt(center)
        scene.add(rectarea)
        break
      }
    }

    // render scenes
    renderer.render(scene, camera)

    // remove dom element
    document.body.removeChild(renderer.domElement)

    // return data
    const info: ModelMetrics = {
      triangles: renderer.info.render.triangles + colliderTriangles,
      materials: materials.size,
      textures: renderer.info.memory.textures,
      meshes: renderer.info.memory.geometries,
      bodies,
      entities: 1
    }
    const image = engine === EngineType.THREE ? renderer.domElement.toDataURL() : await getScreenshot(url, options)

    return { info, image, type: ItemType.WEARABLE }
  } catch (error) {
    // could not render model, default to 0 metrics and default thumnail
    const info = {
      triangles: 0,
      materials: 0,
      textures: 0,
      meshes: 0,
      bodies: 0,
      entities: 1
    }
    const image = TRANSPARENT_PIXEL
    let type = ItemType.WEARABLE
    if (error instanceof Error && error.message === EMOTE_ERROR) {
      type = ItemType.EMOTE
    }
    return { info, image, type }
  }
}

export async function getIsEmote(url: string, options: Partial<Options> = {}) {
  const { gltf, renderer } = await loadGltf(url, options)
  document.body.removeChild(renderer.domElement)
  return gltf.animations.length > 0
}

export async function getEmoteData(url: string, options: Partial<Options> = {}) {
  const {
    gltf: { scene, animations },
    renderer
  } = await loadGltf(url, options)
  document.body.removeChild(renderer.domElement)
  const armatures = scene.children.filter(({ name }) => name.startsWith(ARMATURE_PREFIX))
  const animation = animations[0]
  const propsAnimation = animations.length > 1 ? animations[1] : null

  if (
    scene.children.some(sceneItem =>
      sceneItem.children.some(item => item.name.toLowerCase().includes('basemesh') || item.name.toLowerCase().includes('avatar_mesh'))
    )
  ) {
    throw new EmoteWithMeshError()
  }

  // For social emotes, we need to count the number of additional armatures, currently only one additional armature is supported
  const additionalArmatures = armatures.some(({ name }) => name === ARMATURES.OTHER) ? 1 : 0

  // For social emotes, we don't need to check the duration of the props animation
  if (!additionalArmatures && propsAnimation && propsAnimation.duration !== animation.duration) {
    throw new EmoteAnimationsSyncError()
  }

  let frames = 0

  for (let i = 0; i < animation.tracks.length; i++) {
    const track = animation.tracks[i]
    frames = Math.max(frames, track.times.length)
  }

  return {
    animations,
    armatures,
    metrics: {
      sequences: animations.length,
      duration: animation.duration,
      frames,
      fps: frames / animation.duration,
      props: armatures.some(({ name }) => name === ARMATURES.PROP) ? 1 : 0,
      additionalArmatures
    }
  }
}

export async function getItemData({
  type,
  model,
  wearablePreviewController,
  contents,
  category
}: {
  type: ItemType
  model: string
  wearablePreviewController?: IPreviewController
  contents: Record<string, Blob>
  category?: string
}) {
  const data: { metrics: Metrics; image: string; armatures?: Object3D[]; animations?: AnimationClip[] } = {
    metrics: {} as Metrics,
    image: '',
    armatures: [],
    animations: []
  }

  if (isImageFile(model)) {
    data.metrics = {
      triangles: 100,
      materials: 1,
      textures: 1,
      meshes: 1,
      bodies: 1,
      entities: 1
    }
    data.image = await convertImageIntoWearableThumbnail(contents[THUMBNAIL_PATH] || contents[model], category as WearableCategory)
  } else {
    if (!wearablePreviewController) {
      throw Error('WearablePreview controller needed')
    }
    if (type === ItemType.EMOTE) {
      const emoteData = await getEmoteData(URL.createObjectURL(contents[model]))
      data.metrics = emoteData.metrics
      data.armatures = emoteData.armatures
      data.animations = emoteData.animations
    } else {
      data.metrics = await wearablePreviewController.scene.getMetrics()
    }
    data.image = await wearablePreviewController.scene.getScreenshot(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
  }

  return data
}
