import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { Item, ItemType } from 'modules/item/types'
import {
  saveItemRequest,
  SaveItemRequestAction,
  setPriceAndBeneficiaryRequest,
  SetPriceAndBeneficiaryRequestAction
} from 'modules/item/actions'
import { Variant } from 'decentraland-dapps/dist/modules/features/types'

export type Props = ModalProps & {
  item: Item<ItemType.WEARABLE | ItemType.EMOTE>
  error: string | null
  isLoading: boolean
  metadata: EditPriceAndBeneficiaryModalMetadata
  itemSortedContents?: Record<string, Blob>
  mountNode?: HTMLDivElement | undefined
  withExpirationDate?: boolean
  isOffchain?: boolean
  isOffchainPublicItemOrdersEnabledVariants: Variant | null
  onSave: typeof saveItemRequest | ((item: Item) => void)
  onSetPriceAndBeneficiary:
    | typeof setPriceAndBeneficiaryRequest
    | ((itemId: string, priceInWei: string, beneficiary: string, expiresAt?: Date) => void)
  onSkip?: () => void
}

export type State = {
  price?: string
  beneficiary?: string
  isFree: boolean
  isOwnerBeneficiary: boolean
  expirationDate?: string
}

export type EditPriceAndBeneficiaryModalMetadata = {
  itemId: string
}

export type OwnProps = Pick<Props, 'metadata' | 'item' | 'mountNode'>
export type MapStateProps = Pick<Props, 'item' | 'error' | 'isLoading' | 'isOffchainPublicItemOrdersEnabledVariants'>
export type MapDispatchProps = Pick<Props, 'onSave' | 'onSetPriceAndBeneficiary'>
export type MapDispatch = Dispatch<SaveItemRequestAction | SetPriceAndBeneficiaryRequestAction>
