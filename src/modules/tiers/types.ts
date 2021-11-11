import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  buyThirdPartyItemTiersFailure,
  buyThirdPartyItemTiersRequest,
  buyThirdPartyItemTiersSuccess,
  fetchThirdPartyItemTiersFailure,
  fetchThirdPartyItemTiersRequest,
  fetchThirdPartyItemTiersSuccess
} from './actions'

export type ThirdPartyItemTier = {
  id: string
  value: string
  price: string
}

export type TiersState = {
  data: {
    thirdPartyItems: ThirdPartyItemTier[]
  }
  loading: LoadingState
  error: string | null
}

export type BuyThirdPartyItemTiersRequestAction = ReturnType<typeof buyThirdPartyItemTiersRequest>
export type BuyThirdPartyItemTiersSuccessAction = ReturnType<typeof buyThirdPartyItemTiersSuccess>
export type BuyThirdPartyItemTiersFailureAction = ReturnType<typeof buyThirdPartyItemTiersFailure>

export type FetchThirdPartyItemTiersRequestAction = ReturnType<typeof fetchThirdPartyItemTiersRequest>
export type FetchThirdPartyItemTiersSuccessAction = ReturnType<typeof fetchThirdPartyItemTiersSuccess>
export type FetchThirdPartyItemTiersFailureAction = ReturnType<typeof fetchThirdPartyItemTiersFailure>
