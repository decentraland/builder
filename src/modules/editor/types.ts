import { WearableBodyShape, WearableCategory } from '@dcl/schemas'
import { BodyShapeRespresentation, Wearable } from 'decentraland-ecs'

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
  POOL = 'pool'
}

export type OpenEditorOptions = {
  isReadOnly: boolean
  type: PreviewType
}

export type SelectedBaseWearablesByBodyShape = Record<WearableBodyShape, Record<string, Wearable | null>>

export type CatalystWearable = {
  id: string
  description: string
  thumbnail: string
  rarity: ''
  data: {
    tags: string[]
    category: WearableCategory
    replaces?: WearableCategory[]
    hides?: WearableCategory[]
    representations: {
      bodyShapes: WearableBodyShape[]
      mainFile: string
      overrideReplaces: []
      overrideHides: []
      contents: {
        key: string
        url: string
      }[]
    }[]
  }
  i18n: { code: string; text: string }[]
  createdAt: number
  updatedAt: number
}

export type PatchedWearable = Wearable & {
  hides: string[]
  representations: BodyShapeRespresentation & { overrideReplaces: string[]; overrideHides: string[] }[]
}
