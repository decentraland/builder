import { Dispatch } from 'redux'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { WithAuthorizedActionProps } from 'decentraland-dapps/dist/containers/withAuthorizedAction'
import { publishCollectionRequest, PublishCollectionRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
import { Item, BlockchainRarity } from 'modules/item/types'
import { fetchRaritiesRequest, FetchRaritiesRequestAction } from 'modules/item/actions'

export enum PublishWizardCollectionSteps {
  CONFIRM_COLLECTION_NAME,
  CONFIRM_COLLECTION_ITEMS,
  REVIEW_CONTENT_POLICY,
  PAY_PUBLICATION_FEE,
  COLLECTION_PUBLISHED
}

export type Props = ModalProps & {
  metadata: PublishCollectionModalMetadata
  wallet: Wallet
  collection: Collection
  items: Item[]
  rarities: BlockchainRarity[]
  unsyncedCollectionError: string | null
  collectionError: string | null
  itemError: string | null
  isLoading: boolean
  isPublishCollectionsWertEnabled: boolean
  onPublish: typeof publishCollectionRequest
  onFetchRarities: typeof fetchRaritiesRequest
} & WithAuthorizedActionProps

export type PublishCollectionModalMetadata = {
  collectionId: string
}

export type MapStateProps = Pick<
  Props,
  | 'wallet'
  | 'collection'
  | 'items'
  | 'rarities'
  | 'unsyncedCollectionError'
  | 'collectionError'
  | 'itemError'
  | 'isLoading'
  | 'isPublishCollectionsWertEnabled'
>
export type MapDispatchProps = Pick<Props, 'onPublish' | 'onFetchRarities'>
export type MapDispatch = Dispatch<PublishCollectionRequestAction | FetchRaritiesRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
