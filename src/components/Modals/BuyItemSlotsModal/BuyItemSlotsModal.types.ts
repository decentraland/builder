import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { ThirdPartyItemTier } from 'modules/tiers/types'

export type Props = ModalProps & {
  onBuyItemSlots: unknown
  isBuyingItemSlots: boolean
  isFetchingTiers: boolean
  onFetchThirdPartyItemSlots: unknown
  manaBalance: number
  tiers: ThirdPartyItemTier[]
}

export type State = {
  selectedTierId: string | undefined
}

export type MapStateProps = Pick<Props, 'isBuyingItemSlots' | 'isFetchingTiers' | 'manaBalance' | 'tiers'>
export type MapDispatchProps = Pick<Props, 'onBuyItemSlots' | 'onFetchThirdPartyItemSlots'>
// export type MapDispatch = Dispatch<RescueItemsRequestAction | DeployEntitiesRequestAction | ApproveCollectionRequestAction>
