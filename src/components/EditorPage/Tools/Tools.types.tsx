export type ToolName = 'zoom-out' | 'zoom-in' | 'shortcuts' | 'reset-camera'

export type DefaultProps = {
  onClick: (toolName: ToolName) => any
}

export type Props = DefaultProps & {}

export type State = {
  isShortcutHelpOpen: boolean
}
