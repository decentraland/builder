import { Reducer, Store } from 'redux'
import { RouterState } from 'connected-react-router'
import { LocationState } from 'decentraland-dapps/dist/modules/location/reducer'
import { TranslationState } from 'decentraland-dapps/dist/modules/translation/reducer'
import { StorageState } from 'decentraland-dapps/dist/modules/storage/reducer'
import { WalletState } from 'decentraland-dapps/dist/modules/wallet/reducer'

export type RootState = {
  location: LocationState
  translation: TranslationState
  storage: StorageState
  wallet: WalletState
  router: RouterState
}

export type RootStore = Store<RootState>
export type RootReducer = Reducer<RootState>
