import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {
  email: string
  onSetEmail: (email: string) => void
}

export type State = {
  step: number
  isLoading: boolean
  email: string
}

export type Step = {
  thumbnail: string
  description: string
}

export type MapStateProps = Pick<Props, 'email'>
export type MapDispatchProps = Pick<Props, 'onSetEmail'>
