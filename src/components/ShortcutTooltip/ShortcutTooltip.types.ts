import { PopupProps } from 'decentraland-ui'
import { ShortcutDefinition, Shortcut } from 'modules/keyboard/types'

export type DefaultProps = {
  className: string
  popupClassName: string
  onOpen?: (event: React.MouseEvent<HTMLElement>) => void
  onClose?: (event: React.MouseEvent<HTMLElement>) => void
}

export type Props = DefaultProps & {
  shortcut: Shortcut
  shortcutDefinition: ShortcutDefinition
  position: PopupProps['position']
  children: React.ReactNode
}

export type OwnProps = Pick<Props, 'shortcut' | 'className' | 'position' | 'children' | 'onOpen' | 'onClose'>
export type MapStateProps = Pick<Props, 'shortcutDefinition'>
