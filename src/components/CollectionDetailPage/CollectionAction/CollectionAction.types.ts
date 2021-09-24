import { Dispatch } from 'react'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  wallet: Wallet
  collection: Collection
  items: Item[]
  authorizations: Authorization[]
  onPublish: (collectionId: string) => void
}

export type MapStateProps = Pick<Props, 'wallet' | 'collection' | 'items' | 'authorizations'>
export type MapDispatchProps = Pick<Props, 'onPublish'>
export type MapDispatch = Dispatch<OpenModalAction>
