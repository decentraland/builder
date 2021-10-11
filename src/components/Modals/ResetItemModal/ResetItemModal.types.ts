import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ResetItemRequestAction } from 'modules/item/actions'
import { Dispatch } from 'redux'

type Metadata = {
  itemId: string
}

export type Props = Omit<ModalProps, 'metadata'> & {
  metadata: Metadata
  error: string | null
  isLoading: boolean
  onConfirm: () => void
}

export type MapStateProps = Pick<Props, 'error' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onConfirm'>
export type MapDispatch = Dispatch<ResetItemRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
