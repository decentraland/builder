import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { deleteCollectionRequest, DeleteCollectionRequestAction } from 'modules/collection/actions'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { LocationStateProps } from 'modules/location/types'

export type Props = {
  collection: Collection
  items: Item[]
  name: string
  onOpenModal: typeof openModal
  onDelete: typeof deleteCollectionRequest
  onNavigate: (path: string, locationState?: LocationStateProps) => void
}

export type OwnProps = Pick<Props, 'collection' | 'items'>
export type MapStateProps = Pick<Props, 'name'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onDelete'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | DeleteCollectionRequestAction>
