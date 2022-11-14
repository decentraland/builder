import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & Record<string, unknown>

export type State = {
  step: number
}

export type Step = {
  thumbnail: string
  description: string
}

export type MapDispatchProps = Pick<Props, 'onClose'>
