import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Collection } from 'modules/collection/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'

export type Props = {
  address?: string
  collection: Collection
  curation: CollectionCuration | null
  itemCount: number
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'address' | 'itemCount'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
export type OwnProps = Pick<Props, 'collection' | 'curation'>
