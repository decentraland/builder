export type ToolName = 'zoom-out' | 'zoomin' | 'shortcuts'

export type Props = {
  onClick: (toolName: ToolName) => any
}
