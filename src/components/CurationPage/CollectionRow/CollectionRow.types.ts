import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'

export type Props = {
  address?: string
  collection: Collection
  curation: CollectionCuration | null
  itemCount: number
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'address' | 'itemCount'>
export type MapDispatchProps = Pick<Props, 'onOpenModal'>
export type MapDispatch = Dispatch<OpenModalAction>
export type OwnProps = Pick<Props, 'collection' | 'curation'>
