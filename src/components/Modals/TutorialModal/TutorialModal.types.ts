import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {}

export type State = {
  step: number
}

export type Step = {
  thumbnail: string
  description: string
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onClose'>
