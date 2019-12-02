import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {
  title?: string
  subtitle?: string
  callToAction?: string
  onLogin?: () => void
}
