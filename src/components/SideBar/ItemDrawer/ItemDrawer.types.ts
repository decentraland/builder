import { Dispatch } from 'redux'
import { Category } from 'modules/ui/sidebar/types'
import { AssetPack } from 'modules/assetPack/types'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { Asset } from 'modules/asset/types'

export type Props = {
  categories: Category[]
  selectedAssetPack: AssetPack | null
  selectedCategory: string | null
  search: string
  isList: boolean
  isConnected: boolean
  collectibles: DataByKey<Asset>
}

export type MapStateProps = Pick<
  Props,
  'categories' | 'selectedAssetPack' | 'selectedCategory' | 'search' | 'isList' | 'isConnected' | 'collectibles'
>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch

export type State = {
  search: string
}
