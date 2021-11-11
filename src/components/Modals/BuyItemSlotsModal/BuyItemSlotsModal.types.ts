import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { buyThirdPartyItemTiersRequest, fetchThirdPartyItemTiersRequest } from 'modules/tiers/actions'
import { ThirdPartyItemTier, BuyThirdPartyItemTiersRequestAction, FetchThirdPartyItemTiersRequestAction } from 'modules/tiers/types'
import { ThirdParty } from 'modules/thirdParty/types'

export type Props = ModalProps & {
  isBuyingItemSlots: boolean
  isFetchingTiers: boolean
  thirdParty: ThirdParty
  onBuyItemSlots: typeof buyThirdPartyItemTiersRequest
  onFetchThirdPartyItemSlots: typeof fetchThirdPartyItemTiersRequest
  manaBalance: number
  tiers: ThirdPartyItemTier[]
  metadata: { thirdParty: ThirdParty }
  error: string | null
}

export type MapStateProps = Pick<Props, 'isBuyingItemSlots' | 'isFetchingTiers' | 'manaBalance' | 'tiers' | 'error'>
export type MapDispatchProps = Pick<Props, 'onBuyItemSlots' | 'onFetchThirdPartyItemSlots'>
export type MapDispatch = Dispatch<FetchThirdPartyItemTiersRequestAction | BuyThirdPartyItemTiersRequestAction>
