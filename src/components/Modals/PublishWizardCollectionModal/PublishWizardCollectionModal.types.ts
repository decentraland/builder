import { AuthorizationStepStatus } from 'decentraland-ui'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
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
    // Slots in Ether
    minSlots: string
  }
}

export type Props = Omit<ModalProps, 'metadata'> & {
  metadata: PublishCollectionModalMetadata
  wallet: Wallet
  thirdParty: ThirdParty | null
  collection: Collection
  itemsToPublish: Item[]
  itemsWithChanges: Item[]
  price?: Price
  unsyncedCollectionError: string | null
  collectionError: string | null
  itemError: string | null
  isLoading: boolean
  isPublishingFinished: boolean
  isPublishCollectionsWertEnabled: boolean
  publishingStatus: AuthorizationStepStatus
  onPublish: (
    email: string,
    subscribeToNewsletter: boolean,
    paymentMethod: PaymentMethod,
    cheque?: Cheque,
    maxPrice?: string,
    minSlots?: string
  ) => unknown
  onFetchPrice: () => unknown
}

export type PublishCollectionModalMetadata = {
  collectionId: string
  itemsWithChanges?: Item[]
  itemsToPublish?: Item[]
}
export type OwnProps = Pick<Props, 'metadata'> & Omit<ModalProps, 'metadata'>
