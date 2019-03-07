import { PopupProps } from 'decentraland-ui'
import { ShortcutDefinition, Shortcut } from 'modules/keyboard/types'

export type DefaultProps = {
  className: string
  popupClassName: string
  onOpen: (event: React.MouseEvent<HTMLElement>) => any
  onClose: (event: React.MouseEvent<HTMLElement>) => any
}

export type Props = DefaultProps & {
  shortcut: Shortcut
  shortcutDefinition: ShortcutDefinition
  position: PopupProps['position']
}

export type OwnProps = Pick<Props, 'shortcut' | 'position'>
export type MapStateProps = Pick<Props, 'shortcutDefinition'>
export type MapDispatchProps = {}
