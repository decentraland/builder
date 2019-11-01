import { Dispatch } from 'redux'
import { ConnectWalletRequestAction, connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Category } from 'modules/ui/sidebar/types'
import { AssetPack } from 'modules/assetPack/types'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Asset } from 'modules/asset/types'
import { DeselectEntityAction } from 'modules/editor/actions'

export type Props = {
  categories: Category[]
  selectedAssetPack: AssetPack | null
  selectedCategory: string | null
  search: string
  isList: boolean
  isConnected: boolean
  collectibles: DataByKey<Asset>
  isLoadingAssets: boolean
  onConnect: typeof connectWalletRequest
  selectedEntityId: string | null
  hasScript: boolean
  onDeselect: () => void
}

export type MapStateProps = Pick<
  Props,
  | 'categories'
  | 'selectedAssetPack'
  | 'selectedCategory'
  | 'search'
  | 'isList'
  | 'isConnected'
  | 'isLoadingAssets'
  | 'collectibles'
  | 'selectedEntityId'
  | 'hasScript'
>
export type MapDispatchProps = Pick<Props, 'onConnect' | 'onDeselect'>
export type MapDispatch = Dispatch<ConnectWalletRequestAction | DeselectEntityAction>

export type State = {}
