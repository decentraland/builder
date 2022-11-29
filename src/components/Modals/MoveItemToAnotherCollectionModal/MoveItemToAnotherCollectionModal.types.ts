import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Collection } from 'modules/collection/types'
import { setItemCollection, SetItemCollectionAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'

export type State = {
  collection?: Collection
}

export type Props = ModalProps & {
  metadata: MoveItemToAnotherCollectionModalMetadata
  isLoading: boolean
  onSubmit: typeof setItemCollection
}

export type MoveItemToAnotherCollectionModalMetadata = {
  item: Item
  fromCollection: Collection
}

export type MapStateProps = Pick<Props, 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch<SetItemCollectionAction>
