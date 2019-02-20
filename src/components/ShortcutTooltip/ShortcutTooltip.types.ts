import { PopupProps } from 'decentraland-ui'
import { ShortcutDefinition, Shortcut } from 'modules/keyboard/types'

export type Props = {
  shortcut: Shortcut
  shortcutDefinition: ShortcutDefinition
  position: PopupProps['position']
  className: string
  popupClassName: string
}

export type OwnProps = Pick<Props, 'shortcut' | 'position'>
export type MapStateProps = Pick<Props, 'shortcutDefinition'>
export type MapDispatchProps = {}
