import { Dispatch } from 'redux'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { publishCollectionRequest, PublishCollectionRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
import { Item, Rarity } from 'modules/item/types'

export type Props = ModalProps & {
  metadata: PublishCollectionModalMetadata
  wallet: Wallet | null
  collection: Collection | null
  items: Item[]
  isLoading: boolean
  onPublish: typeof publishCollectionRequest
}

export type State = {
  step: number
  email?: string
  rarities: Rarity[]
  isFetchingRarities: boolean
}

export type PublishCollectionModalMetadata = {
  collectionId: string
}

export type MapStateProps = Pick<Props, 'wallet' | 'collection' | 'items' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onPublish'>
export type MapDispatch = Dispatch<PublishCollectionRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
