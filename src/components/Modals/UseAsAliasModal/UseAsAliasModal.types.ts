import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {
  address?: string
  isLoading: boolean
  onSubmit: (name: string) => void
}

export type State = {
  done: boolean
}

export type MapStateProps = Pick<Props, 'address' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch
