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
  communications: {
    type: string
    signalling: string
  }
  policy: {
    fly: boolean
    voiceEnabled: boolean
    blacklist: string[]
    teleportPosition: string
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
  WEARABLE = 'wearable'
}

export type OpenEditorOptions = {
  isReadOnly: boolean
  type: PreviewType
}

export enum AvatarAnimation {
  IDLE = 'idle',
  WAVE = 'wave',
  FISTPUMP = 'fistpump',
  ROBOT = 'robot',
  RAISEHAND = 'raiseHand',
  CLAP = 'clap',
  MONEY = 'money',
  KISS = 'kiss'
}
