export type ToolName = 'zoom-out' | 'zoom-in' | 'shortcuts' | 'reset-camera'

export type DefaultProps = {
  onClick: (toolName: ToolName) => void
}

export type Props = DefaultProps & {
  isSidebarOpen: boolean
}

export type State = {
  isShortcutPopupOpen: boolean
}
