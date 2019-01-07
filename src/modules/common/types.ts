import { Reducer, Store } from 'redux'
import { RouterState } from 'connected-react-router'
import { LocationState } from 'decentraland-dapps/dist/modules/location/reducer'
import { TranslationState } from 'decentraland-dapps/dist/modules/translation/reducer'
import { StorageState } from 'decentraland-dapps/dist/modules/storage/reducer'
import { WalletState } from 'decentraland-dapps/dist/modules/wallet/reducer'
import { ProjectState } from 'modules/project/reducer'

export type RootState = {
  location: LocationState
  translation: TranslationState
  storage: StorageState
  wallet: WalletState
  project: ProjectState
  router: RouterState
}

export type RootStore = Store<RootState>
export type RootReducer = Reducer<RootState>
