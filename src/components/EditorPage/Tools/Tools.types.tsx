export type ToolName = 'zoom-out' | 'zoom-in' | 'shortcuts' | 'reset-camera'

export type Props = {
  onClick: (toolName: ToolName) => any
}
