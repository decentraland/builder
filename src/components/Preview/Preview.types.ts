export type EditorWindow = typeof window & {
  isDCLInitialized: boolean
  initDCL: () => void
  editor: {
    initEngine: (baseUrl: string) => void
    resize: () => void
    getDCLCanvas: () => Promise<HTMLCanvasElement>
    enableGizmo: (entityId: string) => void
  }
}
