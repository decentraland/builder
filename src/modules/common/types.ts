import { Reducer, Store } from 'redux'
import { RouterState } from 'connected-react-router'
import { LocationState } from 'decentraland-dapps/dist/modules/location/reducer'
import { TranslationState } from 'decentraland-dapps/dist/modules/translation/reducer'
import { StorageState } from 'decentraland-dapps/dist/modules/storage/reducer'
import { WalletState } from 'decentraland-dapps/dist/modules/wallet/reducer'
import { ProjectState } from 'modules/project/reducer'
import { SceneState } from 'modules/scene/reducer'
import { ComponentState } from 'modules/component/reducer'
import { EntityState } from 'modules/entity/reducer'

export type Vector3 = { x: number; y: number; z: number }

export type RootState = {
  location: LocationState
  translation: TranslationState
  storage: StorageState
  wallet: WalletState
  project: ProjectState
  scene: SceneState
  router: RouterState
  component: ComponentState
  entity: EntityState
}

export type RootStore = Store<RootState>
export type RootReducer = Reducer<RootState>
