import { UpdateEditorAction } from 'modules/editor/actions'

export type Editor = {
  initEngine: () => void
  resize: () => void
  getDCLCanvas: () => Promise<HTMLCanvasElement>
  enableGizmo: (entityId: string) => void
  on: (event: string, listener: (...args: any[]) => void) => void
  off: (event: string, listener: (...args: any[]) => void) => void
  handleMessage: (msg: { type: 'update'; payload: any }) => void
  sendExternalAction: (action: UpdateEditorAction) => void
}

export type EditorWindow = typeof window & {
  isDCLInitialized: boolean
  initDCL: () => void
  editor: Editor
}
