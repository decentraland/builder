import { Dispatch } from 'redux'
import { Vector3 } from 'modules/common/types'
import { UpdateEditorAction, SetEditorReadyAction, OpenEditorAction, openEditor } from 'modules/editor/actions'
import { Project } from 'modules/project/types'
import { Gizmo } from 'modules/editor/types'

export type Editor = {
  initEngine: (x: number, y: number) => Promise<void>
  resize: () => void
  getDCLCanvas: () => Promise<HTMLCanvasElement>
  enableGizmo: (entityId: string) => void
  on: (event: string, listener: (...args: any[]) => void) => void
  off: (event: string, listener: (...args: any[]) => void) => void
  handleMessage: (msg: { type: 'update'; payload: any }) => void
  sendExternalAction: (action: UpdateEditorAction) => void
  setPlayMode: (enabled: boolean) => void
  setCameraZoomDelta: (delta: number) => void
  setCameraRotation: (alpha: number) => void
  resetCameraZoom: () => void
  setCameraPosition: (position: Vector3) => void
  selectGizmo: (gizmo: Gizmo) => void
}

export type EditorWindow = typeof window & {
  isDCLInitialized: boolean
  initDCL: () => void
  editor: Editor
}

export type Props = {
  isLoading: boolean
  onOpenEditor: typeof openEditor
  layout: Project['parcelLayout']
}

export type State = {}

export type MapStateProps = Pick<Props, 'isLoading' | 'layout'>
export type MapDispatchProps = Pick<Props, 'onOpenEditor'>
export type MapDispatch = Dispatch<SetEditorReadyAction | OpenEditorAction>
