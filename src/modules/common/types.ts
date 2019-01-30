import { Reducer, Store } from 'redux'
import { RouterState } from 'connected-react-router'
import { LocationState } from 'decentraland-dapps/dist/modules/location/reducer'
import { TranslationState } from 'decentraland-dapps/dist/modules/translation/reducer'
import { StorageState } from 'decentraland-dapps/dist/modules/storage/reducer'
import { WalletState } from 'decentraland-dapps/dist/modules/wallet/reducer'

import { AssetPackState } from 'modules/assetPack/reducer'
import { AssetState } from 'modules/asset/reducer'
import { CategoryState } from 'modules/category/reducer'
import { ProjectState } from 'modules/project/reducer'
import { UndoableSceneState } from 'modules/scene/reducer'
import { EditorState } from 'modules/editor/reducer'

export type Vector3 = { x: number; y: number; z: number }

export type Quaternion = { x: number; y: number; z: number; w: number }

export type RootState = {
  location: LocationState
  translation: TranslationState
  storage: StorageState
  wallet: WalletState
  assetPack: AssetPackState
  asset: AssetState
  category: CategoryState
  project: ProjectState
  scene: UndoableSceneState
  router: RouterState
  editor: EditorState
}

export type RootStore = Store<RootState>
export type RootReducer = Reducer<RootState>
