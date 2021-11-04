import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'

export type ThirdPartyItemTier = {
  id: string
  value: string
  price: string
}

export type TiersState = {
  data: {
    thirdParty: ThirdPartyItemTier[]
  }
  loading: LoadingState
  error: string | null
}
