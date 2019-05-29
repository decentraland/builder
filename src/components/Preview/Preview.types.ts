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
import { Layout } from 'modules/project/types'
import { Gizmo } from 'modules/editor/types'
import { dropItem, DropItemAction } from 'modules/scene/actions'

export type Editor = {
  initEngine: (x: number, y: number) => Promise<void>
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
  selectEntity: (entityId?: string) => void
  getMouseWorldPosition: (x: number, y: number) => Promise<Vector3>
  preloadFile: (url: string, arrayBuffer?: boolean) => void
  getCameraTarget: () => Promise<Vector3>
  takeScreenshot: (mime?: string) => Promise<string>
  setGridResolution: (position: number, rotation: number, scale: number) => void
  getLoadingEntity: () => any | null
}

export type EditorWindow = typeof window & {
  isDCLInitialized: boolean
  initDCL: () => void
  editor: Editor
}

export type Props = {
  isLoading: boolean
  onOpenEditor: typeof openEditor
  onDropItem: typeof dropItem
  layout: Layout
}

export type State = {}

export type MapStateProps = Pick<Props, 'isLoading' | 'layout'>
export type MapDispatchProps = Pick<Props, 'onOpenEditor' | 'onDropItem'>
export type MapDispatch = Dispatch<SetEditorReadyAction | OpenEditorAction | DropItemAction>
