import { Category } from 'modules/ui/sidebar/types'
import { AssetPack } from 'modules/assetPack/types'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Asset } from 'modules/asset/types'

export type Props = {
  categories: Category[]
  selectedAssetPack: AssetPack | null
  selectedCategory: string | null
  search: string
  showOnlyAssetsWithScripts: boolean
  isList: boolean
  isConnected: boolean
  collectibles: DataByKey<Asset>
  isLoadingAssets: boolean
  selectedEntityIds: string[]
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
  | 'selectedEntityIds'
  | 'showOnlyAssetsWithScripts'
>
export type MapDispatchProps = {}
export type MapDispatch = {}

export type State = {}
