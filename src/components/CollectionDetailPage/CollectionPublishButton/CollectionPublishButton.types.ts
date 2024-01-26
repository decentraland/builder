import { Dispatch } from 'react'
import { OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'
import { FetchCollectionCurationRequestAction } from 'modules/curations/collectionCuration/actions'

export type Props = {
  collection: Collection
  items: Item[]
  status: SyncStatus
  hasPendingCuration: boolean
  onPublish: () => void
  onPush: () => void
  onInit: () => void
}

export type OwnProps = Pick<Props, 'collection'>
export type MapStateProps = Pick<Props, 'items' | 'status' | 'hasPendingCuration'>
export type MapDispatchProps = Pick<Props, 'onPublish' | 'onPush' | 'onInit'>
export type MapDispatch = Dispatch<OpenModalAction | FetchCollectionCurationRequestAction>
