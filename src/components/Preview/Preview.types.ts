import { Dispatch } from 'redux'
import { Vector3 } from 'modules/common/types'
import {
  UpdateEditorAction,
  SetEditorReadyAction,
  OpenEditorAction,
  openEditor,
  TogglePreviewAction,
  CloseEditorAction
} from 'modules/editor/actions'
import { UnityKeyboardEvent } from 'modules/editor/types'
import { dropItem, DropItemAction } from 'modules/scene/actions'
import { Project } from 'modules/project/types'

declare type Gizmo = any

export type Editor = {
  initEngine: (container: HTMLElement, x: number, y: number) => Promise<void>
  resize: () => void
  getDCLCanvas: () => Promise<HTMLCanvasElement>
  on: (event: string, listener: (...args: any[]) => void) => void
  off: (event: string, listener: (...args: any[]) => void) => void
  handleMessage: (msg: { type: 'update'; payload: any }) => void
  sendExternalAction: (action: UpdateEditorAction | TogglePreviewAction | CloseEditorAction) => void
  setPlayMode: (enabled: boolean) => void
  setCameraZoomDelta: (delta: number) => void
  setCameraRotation: (alpha: number, beta: number) => void
  resetCameraZoom: () => void
  setCameraPosition: (position: Vector3) => void
  selectGizmo: (gizmo: Gizmo) => void
  selectEntity: (entityId: string) => void
  getMouseWorldPosition: (x: number, y: number) => Promise<Vector3>
  preloadFile: (url: string, arrayBuffer?: boolean) => void
  getCameraTarget: () => Promise<Vector3>
  takeScreenshot: (mime?: string) => Promise<string>
  setGridResolution: (position: number, scale: number, rotation: number) => void
  getLoadingEntity: () => any | null
  onKeyDown: (key: UnityKeyboardEvent) => void
}

export type EditorWindow = typeof window & {
  initDCL: () => void
  editor: Editor
}

export type Props = {
  isLoading: boolean
  onOpenEditor: typeof openEditor
  onDropItem: typeof dropItem
  project: Project
}

export type State = {}

export type MapStateProps = Pick<Props, 'isLoading' | 'project'>
export type MapDispatchProps = Pick<Props, 'onOpenEditor' | 'onDropItem'>
export type MapDispatch = Dispatch<SetEditorReadyAction | OpenEditorAction | DropItemAction>
