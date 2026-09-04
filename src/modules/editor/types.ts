import { BodyShape, HideableWearableCategory, SpringBoneParams, WearableCategory } from '@dcl/schemas'
import type { BodyShapeRespresentation, Wearable } from 'decentraland-ecs'
import type { Vector3 } from 'modules/models/types'
import type { CloseEditorAction, SetScriptUrlAction, TogglePreviewAction, UpdateEditorAction } from './actions'

export enum Gizmo {
  MOVE = 'MOVE',
  ROTATE = 'ROTATE',
  SCALE = 'SCALE',
  NONE = 'NONE'
}

export type EditorScene = {
  baseUrl: string
  display: {
    title: string
  }
  owner: string
  contact: {
    name: string
    email: string
  }
  scene: {
    parcels: string[]
    base: string
  }
  source: {
    origin: 'builder'
  }
  main: string
  _mappings: Record<string, string>
}

export type UnityKeyboardEvent = 'DownArrow' | 'UpArrow' | 'LeftArrow' | 'RightArrow'

export enum PreviewType {
  PROJECT = 'project',
  PUBLIC = 'public',
  POOL = 'pool',
  TEMPLATE = 'template'
}

export type OpenEditorOptions = {
  isReadOnly: boolean
  type: PreviewType
}

export type SelectedBaseWearablesByBodyShape = Record<BodyShape, Record<string, Wearable | null>>

export type CatalystWearable = {
  id: string
  description: string
  thumbnail: string
  rarity: ''
  data: {
    tags: string[]
    category: WearableCategory
    replaces?: HideableWearableCategory[]
    hides?: HideableWearableCategory[]
    representations: {
      bodyShapes: BodyShape[]
      mainFile: string
      overrideReplaces: []
      overrideHides: []
      contents: {
        key: string
        url: string
      }[]
    }[]
    blockVrmExport?: boolean
    outlineCompatible?: boolean
  }
  i18n: { code: string; text: string }[]
  createdAt: number
  updatedAt: number
}

export type PatchedWearable = Wearable & {
  hides: string[]
  representations: BodyShapeRespresentation & { overrideReplaces: string[]; overrideHides: string[] }[]
}

export { SpringBoneParams }

type BaseBoneNode = {
  name: string
  nodeId: number
  children: number[]
}

export type AvatarBoneNode = BaseBoneNode & { type: 'avatar' }

export type SpringBoneNode = BaseBoneNode & {
  type: 'spring'
  params?: SpringBoneParams
}

export type BoneNode = AvatarBoneNode | SpringBoneNode

export type Editor = {
  initEngine: (container: HTMLElement, buildConfigPath: string) => Promise<void>
  getDCLCanvas: () => Promise<HTMLCanvasElement>
  on: (event: string, listener: (...args: any[]) => void) => void
  off: (event: string, listener: (...args: any[]) => void) => void
  handleMessage: (msg: { type: 'update'; payload: any }) => void
  sendExternalAction: (action: UpdateEditorAction | TogglePreviewAction | CloseEditorAction | SetScriptUrlAction) => void
  setPlayMode: (enabled: boolean) => void
  setCameraZoomDelta: (delta: number) => void
  setCameraRotation: (alpha: number, beta: number) => void
  resetCameraZoom: () => void
  setCameraPosition: (position: Vector3) => void
  selectGizmo: (gizmo: Gizmo) => void
  setSelectedEntities: (entityId: string[]) => void
  getMouseWorldPosition: (x: number, y: number) => Promise<Vector3>
  preloadFile: (url: string, arrayBuffer?: boolean) => void
  getCameraTarget: () => Promise<Vector3>
  takeScreenshot: (mime?: string) => Promise<string>
  setGridResolution: (position: number, rotation: number, scale: number) => void
  getLoadingEntities: () => string[] | null
  onKeyDown: (key: UnityKeyboardEvent) => void
}

export type EditorWindow = typeof window & {
  initDCL: () => void
  editor: Editor
}
