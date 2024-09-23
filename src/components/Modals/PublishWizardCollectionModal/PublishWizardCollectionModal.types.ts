import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { WithAuthorizedActionProps } from 'decentraland-dapps/dist/containers/withAuthorizedAction'
import { Collection, PaymentMethod } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { Cheque, ThirdParty } from 'modules/thirdParty/types'

export enum PublishWizardCollectionSteps {
  CONFIRM_COLLECTION_NAME,
  CONFIRM_COLLECTION_ITEMS,
  REVIEW_CONTENT_POLICY,
  PAY_PUBLICATION_FEE,
  COLLECTION_PUBLISHED
}

export type Price = {
  item: {
    // USD in WEI
    usd: string
    // MANA in WEI
    mana: string
  }
  programmatic?: {
    // USD in WEI
    usd: string
    // MANA in WEI
    mana: string
  }
}

export type Props = Omit<ModalProps, 'metadata'> & {
  metadata: PublishCollectionModalMetadata
  wallet: Wallet
  thirdParty?: ThirdParty
  collection: Collection
  itemsToPublish: Item[]
  itemsWithChanges: Item[]
  price?: Price
  unsyncedCollectionError: string | null
  collectionError: string | null
  itemError: string | null
  isLoading: boolean
  isPublished: boolean
  isPublishCollectionsWertEnabled: boolean
  onPublish: (email: string, subscribeToNewsletter: boolean, paymentMethod: PaymentMethod, cheque?: Cheque, maxPrice?: string) => unknown
  onFetchPrice: () => unknown
} & WithAuthorizedActionProps

export type PublishCollectionModalMetadata = {
  collectionId: string
  itemsWithChanges: Item[]
  itemsToPublish: Item[]
}
export type OwnProps = Pick<Props, 'metadata'> & Omit<ModalProps, 'metadata'>
