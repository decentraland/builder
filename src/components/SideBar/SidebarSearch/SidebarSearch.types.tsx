import { Dispatch } from 'redux'

import { searchAssets, SearchAssetsAction } from 'modules/ui/sidebar/actions'
import { AssetPack } from 'modules/assetPack/types'

export type Props = {
  selectedAssetPack: AssetPack | null
  selectedCategory: string | null
  search: string
  onSearch: typeof searchAssets
  onResetScroll: () => void
}

export type State = {
  search: string
}

export type MapStateProps = Pick<Props, 'selectedAssetPack' | 'selectedCategory' | 'search'>
export type MapDispatchProps = Pick<Props, 'onSearch'>
export type MapDispatch = Dispatch<SearchAssetsAction>
