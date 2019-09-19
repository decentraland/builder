import { Dispatch } from 'redux'

import { AssetPack } from 'modules/assetPack/types'
import {
  setSidebarView,
  selectCategory,
  selectAssetPack,
  SelectAssetPackAction,
  SelectCategoryAction,
  searchAssets,
  SearchAssetsAction
} from 'modules/ui/sidebar/actions'
import { OpenModalAction } from 'modules/modal/actions'

export type Props = {
  selectedAssetPack: AssetPack | null
  selectedCategory: string | null
  search: string
  onSetSidebarView: typeof setSidebarView
  onSelectAssetPack: typeof selectAssetPack
  onSelectCategory: typeof selectCategory
  onSearch: typeof searchAssets
  onCreateAssetPack: () => void
}

export type MapStateProps = Pick<Props, 'selectedAssetPack' | 'selectedCategory' | 'search'>
export type MapDispatchProps = Pick<Props, 'onSelectAssetPack' | 'onSelectCategory' | 'onSearch' | 'onCreateAssetPack'>
export type MapDispatch = Dispatch<SelectAssetPackAction | SelectCategoryAction | SearchAssetsAction | OpenModalAction>
