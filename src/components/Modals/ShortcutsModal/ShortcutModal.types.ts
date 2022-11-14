import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ShortcutLayout } from 'modules/keyboard/types'

export type Props = ModalProps & {
  shortcuts: ShortcutLayout
}

export type MapStateProps = Pick<Props, 'shortcuts'>
