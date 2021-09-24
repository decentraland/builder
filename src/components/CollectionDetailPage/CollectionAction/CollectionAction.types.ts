import { Dispatch } from 'react'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item, SyncStatus } from 'modules/item/types'

export type Props = {
  wallet: Wallet
  collection: Collection
  items: Item[]
  authorizations: Authorization[]
  status: SyncStatus
  onPublish: () => void
}

export type MapStateProps = Pick<Props, 'wallet' | 'collection' | 'items' | 'authorizations' | 'status'>
export type MapDispatchProps = { onPublish: (collectionId: string) => void }
export type MapDispatch = Dispatch<OpenModalAction>
