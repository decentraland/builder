import { Reducer, Store } from 'redux'
import { RouterState } from 'connected-react-router'
import { LocationState } from 'decentraland-dapps/dist/modules/location/reducer'
import { TranslationState } from 'decentraland-dapps/dist/modules/translation/reducer'

export type RootState = {
  location: LocationState
  translation: TranslationState
  router: RouterState
}

export type RootStore = Store<RootState>
export type RootReducer = Reducer<RootState>
