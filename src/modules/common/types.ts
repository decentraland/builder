import { Reducer, Store } from 'redux'
import { action } from 'typesafe-actions'
import { RouterState } from 'connected-react-router'
import { LocationState } from 'decentraland-dapps/dist/modules/location/reducer'
import { TranslationState } from 'decentraland-dapps/dist/modules/translation/reducer'
import { StorageState } from 'decentraland-dapps/dist/modules/storage/reducer'
import { WalletState } from 'decentraland-dapps/dist/modules/wallet/reducer'
import { ModalState } from 'decentraland-dapps/dist/modules/modal/reducer'
import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'
import { RootState } from 'modules/common/types'

import { AssetPackState } from 'modules/assetPack/reducer'
import { AssetState } from 'modules/asset/reducer'
import { UIState } from 'modules/ui/reducer'
import { UserState } from 'modules/user/reducer'
import { ProjectState } from 'modules/project/reducer'
import { UndoableSceneState } from 'modules/scene/reducer'
import { EditorState } from 'modules/editor/reducer'
import { DeploymentState } from 'modules/deployment/reducer'
import { MediaState } from 'modules/media/reducer'
import { AuthState } from 'modules/auth/types'
import { SyncState } from 'modules/sync/types'

export type Vector3 = { x: number; y: number; z: number }

export type Quaternion = { x: number; y: number; z: number; w: number }

const storageLoad = () => action(STORAGE_LOAD, {} as RootState)
export type StorageLoadAction = ReturnType<typeof storageLoad>

export type RootState = {
  auth: AuthState
  location: LocationState
  translation: TranslationState
  storage: StorageState
  wallet: WalletState
  modal: ModalState
  assetPack: AssetPackState
  asset: AssetState
  ui: UIState
  user: UserState
  project: ProjectState
  scene: UndoableSceneState
  router: RouterState
  editor: EditorState
  deployment: DeploymentState
  media: MediaState
  sync: SyncState
}

export type RootStore = Store<RootState>
export type RootReducer = Reducer<RootState>
