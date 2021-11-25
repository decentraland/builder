import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import {
  buyThirdPartyItemTiersRequest,
  BuyThirdPartyItemTiersRequestAction,
  clearTiersError,
  ClearTiersErrorAction,
  fetchThirdPartyItemTiersRequest,
  FetchThirdPartyItemTiersRequestAction
} from 'modules/tiers/actions'
import { ThirdPartyItemTier } from 'modules/tiers/types'
import { ThirdParty } from 'modules/thirdParty/types'

export type Props = ModalProps & {
  isBuyingItemSlots: boolean
  isFetchingTiers: boolean
  thirdParty: ThirdParty
  manaBalance: number
  tiers: ThirdPartyItemTier[]
  metadata: BuyItemSlotsModalMetadata
  error: string | null
  onBuyItemSlots: typeof buyThirdPartyItemTiersRequest
  onFetchThirdPartyItemSlots: typeof fetchThirdPartyItemTiersRequest
  onTierSelected: typeof clearTiersError
}

export type State = {
  selectedTierId: string | undefined
}

export type BuyItemSlotsModalMetadata = {
  thirdParty: ThirdParty
}

export type MapStateProps = Pick<Props, 'isBuyingItemSlots' | 'isFetchingTiers' | 'manaBalance' | 'tiers' | 'error'>
export type MapDispatchProps = Pick<Props, 'onBuyItemSlots' | 'onFetchThirdPartyItemSlots' | 'onTierSelected'>
export type MapDispatch = Dispatch<FetchThirdPartyItemTiersRequestAction | BuyThirdPartyItemTiersRequestAction | ClearTiersErrorAction>
