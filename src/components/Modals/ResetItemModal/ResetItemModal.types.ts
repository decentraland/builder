import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ResetItemRequest } from 'modules/item/actions'
import { Dispatch } from 'redux'

type Metadata = {
  itemId: string
}

export type Props = Omit<ModalProps, 'metadata'> & {
  metadata: Metadata
  onConfirm: () => void
}

export type MapDispatchProps = Pick<Props, 'onConfirm'>
export type MapDispatch = Dispatch<ResetItemRequest>
export type OwnProps = Pick<Props, 'metadata'>
