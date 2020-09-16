import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { setCollection, SetCollectionAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { Dispatch } from 'redux'

export type State = {
  item?: Item
}

export type Props = ModalProps & {
  metadata: AddExistingItemModalMetadata
  isLoading: boolean
  onSubmit: typeof setCollection
}

export type AddExistingItemModalMetadata = {
  collectionId: string
}

export type MapStateProps = Pick<Props, 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch<SetCollectionAction>
