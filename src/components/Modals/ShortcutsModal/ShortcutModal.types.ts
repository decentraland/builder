import { Props as ModalProps, MapDispatchProps as ModalMapDispatchProps, MapDispatch as ModalMapDispatch } from '../Modals.types'
import { ShortcutLayout } from 'modules/keyboard/types'

export type Props = ModalProps & {
  shortcuts: ShortcutLayout
}

export type State = {}

export type MapStateProps = Pick<Props, 'shortcuts'>
export type MapDispatchProps = ModalMapDispatchProps
export type MapDispatch = ModalMapDispatch
