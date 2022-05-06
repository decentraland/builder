import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Collection } from 'modules/collection/types'
import { setCollection, SetCollectionAction } from 'modules/item/actions'
import { Item } from 'modules/item/types'

export type State = {
  collection?: Collection
}

export type Props = ModalProps & {
  metadata: MoveItemToCollectionModallMetadata
  isLoading: boolean
  onSubmit: typeof setCollection
}

export type MoveItemToCollectionModallMetadata = {
  item: Item
}

export type MapStateProps = Pick<Props, 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch<SetCollectionAction>
