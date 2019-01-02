export type EditorWindow = typeof window & {
  isDCLInitialized: boolean
  initDCL: () => void
  editor: {
    initEngine: () => void
    resize: () => void
    getDCLCanvas: () => Promise<HTMLCanvasElement>
  }
}
