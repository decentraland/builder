import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { fetchItemsRequest, FetchItemsRequestAction, setCollection, SetCollectionAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { Dispatch } from 'redux'

export type State = {
  item?: Item
}

export type Props = ModalProps & {
  metadata: AddExistingItemModalMetadata
  address: string | undefined
  isLoading: boolean
  onSubmit: typeof setCollection
  onFetchItems: typeof fetchItemsRequest
}

export type AddExistingItemModalMetadata = {
  collectionId: string
}

export type MapStateProps = Pick<Props, 'address' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSubmit' | 'onFetchItems'>
export type MapDispatch = Dispatch<SetCollectionAction | FetchItemsRequestAction>
