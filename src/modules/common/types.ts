import { Reducer, Store } from 'redux'
import { action } from 'typesafe-actions'
import { RouterState } from 'connected-react-router'
import { TranslationState } from 'decentraland-dapps/dist/modules/translation/reducer'
import { StorageState } from 'decentraland-dapps/dist/modules/storage/reducer'
import { WalletState } from 'decentraland-dapps/dist/modules/wallet/reducer'
import { ModalState } from 'decentraland-dapps/dist/modules/modal/reducer'
import { ProfileState } from 'decentraland-dapps/dist/modules/profile/reducer'
import { AuthorizationState } from 'decentraland-dapps/dist/modules/authorization/reducer'
import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'

import { AssetPackState } from 'modules/assetPack/reducer'
import { AssetState } from 'modules/asset/reducer'
import { UIState } from 'modules/ui/reducer'
import { ProjectState } from 'modules/project/reducer'
import { PoolGroupState } from 'modules/poolGroup/reducer'
import { UndoableSceneState } from 'modules/scene/reducer'
import { EditorState } from 'modules/editor/reducer'
import { DeploymentState } from 'modules/deployment/reducer'
import { MediaState } from 'modules/media/reducer'
import { SyncState } from 'modules/sync/types'
import { PoolState } from 'modules/pool/reducer'
import { IdentityState } from 'modules/identity/reducer'
import { LandState } from 'modules/land/reducer'
import { ENSState } from 'modules/ens/reducer'
import { TransactionState } from 'decentraland-dapps/dist/modules/transaction/reducer'
import { TileState } from 'modules/tile/reducer'
import { CommitteeState } from 'modules/committee/reducer'
import { CollectionState } from 'modules/collection/reducer'
import { ItemState } from 'modules/item/reducer'
import { LocationState } from 'modules/location/reducer'
import { StatsState } from 'modules/stats/reducer'

export type Vector3 = { x: number; y: number; z: number }

export type Quaternion = { x: number; y: number; z: number; w: number }

const storageLoad = () => action(STORAGE_LOAD, {} as RootState)
export type StorageLoadAction = ReturnType<typeof storageLoad>

export type RootState = {
  transaction: TransactionState
  translation: TranslationState
  storage: StorageState
  wallet: WalletState
  authorization: AuthorizationState
  modal: ModalState
  assetPack: AssetPackState
  asset: AssetState
  ui: UIState
  project: ProjectState
  poolGroup: PoolGroupState
  pool: PoolState
  profile: ProfileState
  scene: UndoableSceneState
  router: RouterState
  editor: EditorState
  deployment: DeploymentState
  media: MediaState
  sync: SyncState
  identity: IdentityState
  land: LandState
  ens: ENSState
  tile: TileState
  committee: CommitteeState
  collection: CollectionState
  item: ItemState
  location: LocationState
  stats: StatsState
}

export type RootStore = Store<RootState>
export type RootReducer = Reducer<RootState>
