import { Dispatch } from 'redux'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { publishCollectionRequest, PublishCollectionRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
import { Item, Rarity } from 'modules/item/types'
import { fetchRaritiesRequest, FetchRaritiesRequestAction } from 'modules/item/actions'

export enum PublishWizardCollectionSteps {
  CONFIRM_COLLECTION_NAME,
  CONFIRM_COLLECTION_ITEMS,
  REVIEW_CONTENT_POLICY,
  PAY_PUBLICATION_FEE
}

export type Props = ModalProps & {
  metadata: PublishCollectionModalMetadata
  wallet: Wallet | null
  collection: Collection | null
  items: Item[]
  rarities: Rarity[]
  isPublishLoading: boolean
  isFetchingItems: boolean
  isFetchingRarities: boolean
  unsyncedCollectionError: string | null
  collectionError: string | null
  itemError: string | null
  isNewEmotesPublishFlagOn: boolean
  onPublish: typeof publishCollectionRequest
  onFetchRarities: typeof fetchRaritiesRequest
}

export type State = {
  step: number
  email?: string
  emailFocus: boolean
  collectionName: string
}

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
  | 'isPublishLoading'
  | 'isFetchingItems'
  | 'isFetchingRarities'
  | 'collectionError'
  | 'itemError'
  | 'isNewEmotesPublishFlagOn'
>
export type MapDispatchProps = Pick<Props, 'onPublish' | 'onFetchRarities'>
export type MapDispatch = Dispatch<PublishCollectionRequestAction | FetchRaritiesRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
