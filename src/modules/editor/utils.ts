import { EditorScene } from 'modules/editor/types'
import { Project } from 'modules/project/types'
import { getSceneDefinition } from 'modules/project/export'
import { BUILDER_SERVER_URL } from 'lib/api/builder'
import { Vector3 } from 'modules/common/types'

const script = require('raw-loader!../../ecsScene/scene.js')

export const THUMBNAIL_WIDTH = 984
export const THUMBNAIL_HEIGHT = 728

export function getNewEditorScene(project: Project): EditorScene {
  const mappings = {
    'game.js': `data:application/javascript;base64,${btoa(script)}`,
    'scene.json': 'Qm' // stub required by the client
  }

  return {
    ...getSceneDefinition(project, { x: 0, y: 0 }, 'east'),
    baseUrl: `${BUILDER_SERVER_URL}/storage/assets/` as string,
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
  const newScale = { x: 0, y: 0, z: 0 }

  if (scale.x === 0) {
    newScale.x = 0.001
  }

  if (scale.y === 0) {
    newScale.y = 0.001
  }

  if (scale.z === 0) {
    newScale.z = 0.001
  }

  return newScale
}
