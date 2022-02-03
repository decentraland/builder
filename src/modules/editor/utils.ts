import { BodyShapeRespresentation, Wearable } from 'decentraland-ecs'
import { CatalystWearable, EditorScene, UnityKeyboardEvent } from 'modules/editor/types'
import { Project } from 'modules/project/types'
import { getSceneDefinition } from 'modules/project/export'
import { getContentsStorageUrl } from 'lib/api/builder'
import { capitalize } from 'lib/text'
import { Vector3 } from 'modules/models/types'
import { getSkinHiddenCategories } from 'modules/item/utils'
import { TRANSPARENT_PIXEL } from 'lib/getModelData'
import { toLegacyURN } from 'lib/urnLegacy'
import { Scene, EntityDefinition, ComponentDefinition, ComponentType } from 'modules/scene/types'
import { getMetrics } from 'components/AssetImporter/utils'
import { Item, WearableBodyShape, WearableCategory } from 'modules/item/types'
import { base64ArrayBuffer } from './base64'

const script = require('raw-loader!../../ecsScene/scene.js')

export const THUMBNAIL_WIDTH = 984
export const THUMBNAIL_HEIGHT = 728
export const POSITION_GRID_RESOLUTION = 0.5
export const ROTATION_GRID_RESOLUTION = Math.PI / 16
export const SCALE_GRID_RESOLUTION = 0.5
export const SCALE_MIN_LIMIT = 0.001

export function getNewEditorScene(project: Project): EditorScene {
  const encoder = new TextEncoder()
  const mappings = {
    'game.js': `data:application/javascript;base64,${base64ArrayBuffer(encoder.encode(script))}`,
    'scene.json': 'Qm' // stub required by the client
  }

  return {
    ...getSceneDefinition(project, { x: 0, y: 0 }, 'east', null, null),
    baseUrl: getContentsStorageUrl(),
    display: {
      title: project.title
    },
    owner: 'Decentraland',
    contact: {
      name: 'Decentraland',
      email: 'support@decentraland.org'
    },
    communications: {
      type: 'webrtc',
      signalling: 'https://rendezvous.decentraland.org'
    },
    policy: {
      fly: true,
      voiceEnabled: true,
      blacklist: [],
      teleportPosition: '0,0,0'
    },
    main: 'game.js',
    _mappings: mappings
  } as EditorScene
}

// Screenshots

export function imageToDataUri(img: HTMLImageElement, width: number, height: number) {
  // create an off-screen canvas
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')

  if (!ctx) return null

  // set its dimension to target size
  canvas.width = width
  canvas.height = height

  // draw source image into the off-screen canvas:
  ctx.drawImage(img, 0, 0, width, height)

  // encode image to data-uri with base64 version of compressed image
  return canvas.toDataURL()
}

export function resizeScreenshot(screenshot: string, maxWidth: number, maxHeight: number) {
  return new Promise<string | null>(resolve => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      let ratio = 0
      if (width > maxWidth) {
        ratio = maxWidth / width
        width = maxWidth
        height *= ratio
      } else if (height > maxHeight) {
        ratio = maxHeight / height
        width *= ratio
        height = maxHeight
      }
      const newDataUri = imageToDataUri(img, width, height)
      resolve(newDataUri)
    }
    img.src = screenshot
  })
}

export function snapScale(scale: Vector3): Vector3 {
  return {
    x: scale.x === 0 ? SCALE_MIN_LIMIT : scale.x,
    y: scale.y === 0 ? SCALE_MIN_LIMIT : scale.y,
    z: scale.z === 0 ? SCALE_MIN_LIMIT : scale.z
  }
}

export function createReadyOnlyScene(scene: Scene): Scene {
  const readOnlyEntities = Object.values(scene.entities).reduce((newEntities, entity) => {
    newEntities[entity.id] = { ...entity, disableGizmos: true }
    return newEntities
  }, {} as Record<string, EntityDefinition>)

  return {
    ...scene,
    entities: readOnlyEntities
  }
}

export function convertToUnityKeyboardEvent(e: KeyboardEvent): UnityKeyboardEvent | null {
  switch (e.key) {
    case 'Down':
    case 'ArrowDown':
      return 'DownArrow'
    case 'Up':
    case 'ArrowUp':
      return 'UpArrow'
    case 'Left':
    case 'ArrowLeft':
      return 'LeftArrow'
    case 'Right':
    case 'ArrowRight':
      return 'RightArrow'
  }
  return null
}

export function areEqualTransforms(
  a: ComponentDefinition<ComponentType.Transform>['data'],
  b: ComponentDefinition<ComponentType.Transform>['data']
) {
  return (
    a.position.x === b.position.x &&
    a.position.y === b.position.y &&
    a.position.z === b.position.z &&
    a.rotation.x === b.rotation.x &&
    a.rotation.y === b.rotation.y &&
    a.rotation.z === b.rotation.z &&
    a.rotation.w === b.rotation.w &&
    a.scale.x === b.scale.x &&
    a.scale.y === b.scale.y &&
    a.scale.z === b.scale.z
  )
}

export function createAvatarProject(): Project {
  return {
    id: 'avatar-project',
    title: 'Avatar',
    description: 'Dummy project for the Avatar Editor',
    thumbnail: TRANSPARENT_PIXEL,
    sceneId: 'avatar-scene',
    layout: {
      rows: 1,
      cols: 1
    },
    isPublic: false,
    ethAddress: null,
    createdAt: new Date().toString(),
    updatedAt: new Date().toString()
  }
}

export function createAvatarScene(): Scene {
  return {
    id: 'avatar-scene',
    assets: {},
    components: {},
    entities: {},
    ground: null,
    limits: getMetrics(),
    metrics: getMetrics()
  }
}

export function toWearable(item: Item) {
  return {
    // @TODO: remove toLegacyURN when unity build accepts urn
    id: toLegacyURN(item.id) + '/' + item.updatedAt, // we add the updatedAt suffix to bust the cache
    type: 'wearable',
    category: item.data.category!,
    baseUrl: getContentsStorageUrl(),
    representations: item.data.representations.map<BodyShapeRespresentation>(representation => ({
      bodyShapes: representation.bodyShapes.map(toLegacyURN),
      mainFile: representation.mainFile,
      contents: Object.values(representation.contents).map(path => ({
        file: path,
        hash: item.contents[path]
      })),
      overrideReplaces: representation.overrideReplaces,
      overrideHides: representation.overrideHides
    })),
    replaces: item.data.replaces,
    hides: item.data.hides,
    tags: item.data.tags
  } as Wearable
}

export function mergeWearables(avatar: Wearable[], apply: Wearable[]) {
  const wearables: Record<string, Wearable> = {}
  for (const wearable of [...avatar, ...apply]) {
    wearables[wearable.category || wearable.id] = wearable
  }
  return Object.values(wearables)
}

/**
 * Makes runtime changes to wearable objects before sending them to the ECS scene. This is because we are using an outdated version of the ECS,
 * and certain tweaks need to be made in order to make the up-to-date wearables work on it.
 * @param wearables
 */
export function patchWearables(wearables: Wearable[]) {
  return wearables.map(wearable => {
    // 1. if the category is "skin" we need to hide all the other categories
    if (wearable.category === 'skin') {
      const alreadyHidden: string[] = [...((wearable as any).hides || [])] // The typing from decentraland-ecs is wrong and it misses the hides list
      const hides = Array.from(
        new Set<string>([...alreadyHidden, ...getSkinHiddenCategories()])
      )
      return {
        ...wearable,
        hides,
        representations: wearable.representations.map(representation => ({
          ...representation,
          overrideHides: hides
        }))
      }
    }
    return wearable
  })
}

export const pickRandom = <T>(array: T[]): T => {
  return array[(Math.random() * array.length) | 0]
}

/*
 * Converts stuff like "f_jeans_00" into "Jeans"
 */
export const getName = (wearable: Wearable) => {
  let name = wearable.id.split(':').pop()!
  if (name.startsWith('f_') || name.startsWith('m_')) {
    // Remove prefixes f_ and m_
    name = name.slice(2)
  }
  return name
    .split('_')
    .map(strPart => {
      const part = Number(strPart)
      const isNumeric = !isNaN(part)
      /*
       * Numeric parts are like 00, 01, 02. This ignores the 00, and parses the other ones, like:
       * hair_00 -> hair
       * hair_01 -> hair 2
       * hair_02 -> hair 3
       */
      return !isNumeric || part <= 0 ? strPart : null
    })
    .filter(part => part != null) // Filter out ignored parts
    .map(part => capitalize(part!))
    .join(' ')
}

/**
 * Extracts the base URL from the catalyst items' URL.
 *
 * @param url - The catalyst wearable's URL.
 */
export function extractBaseUrl(url: string): string {
  const baseURLRegex = /(http[s]?:\/\/.+\/content\/contents\/).+/
  const matches = baseURLRegex.exec(url)
  if (matches && matches[1]) {
    return matches[1]
  }
  throw new Error('No base URL found in th URL: ' + url)
}

/**
 * Extracts the wearable's hash from a catalyst wearable's URL.
 *
 * @param url - The catalyst item's URL.
 */
export function extractHash(url: string): string {
  const hashRegex = /http[s]?:\/\/.+\/content\/contents\/([a-zA-Z0-9]+)/
  const matches = hashRegex.exec(url)
  if (matches && matches[1]) {
    return matches[1]
  }
  throw new Error('No hash found in the URL: ' + url)
}

/**
 * Converts a Catalyst's wearable into a Wearable.
 *
 * @param catalystWearable - The catalyst wearable to convert.
 */
export function fromCatalystWearableToWearable(catalystWearable: CatalystWearable): Wearable {
  return {
    id: catalystWearable.id,
    type: 'wearable',
    category: catalystWearable.data.category,
    baseUrl: extractBaseUrl(catalystWearable.thumbnail),
    tags: catalystWearable.data.tags,
    representations: catalystWearable.data.representations.map(representation => ({
      bodyShapes: representation.bodyShapes,
      mainFile: representation.mainFile,
      contents: representation.contents.map(content => ({
        file: content.key,
        hash: extractHash(content.url)
      }))
    }))
  }
}

/**
 * Given a list of wearables, return those which category and body shape are the ones specified in the parameters.
 *
 * @param wearables - The catalyst wearable to convert.
 * @param category - The category to filter by.
 * @param bodyShape - The body shape to filter by.
 */
export function filterWearables(wearables: Wearable[], category: WearableCategory, bodyShape: WearableBodyShape): Wearable[] {
  return wearables.filter(
    wearable =>
      wearable.category === category &&
      wearable.representations.some(representation => representation.bodyShapes.some(_bodyShape => _bodyShape === bodyShape))
  )
}
