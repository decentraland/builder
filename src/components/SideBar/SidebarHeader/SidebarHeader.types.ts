import { Dispatch } from 'redux'

import { AssetPack } from 'modules/assetPack/types'
import {
  setSidebarView,
  selectCategory,
  selectAssetPack,
  SetSidebarViewAction,
  SelectAssetPackAction,
  SelectCategoryAction,
  searchAssets,
  SearchAssetsAction
} from 'modules/ui/sidebar/actions'

export type Props = {
  selectedAssetPack: AssetPack | null
  selectedCategory: string | null
  isList: boolean
  search: string
  onSetSidebarView: typeof setSidebarView
  onSelectAssetPack: typeof selectAssetPack
  onSelectCategory: typeof selectCategory
  onSearch: typeof searchAssets
}

export type MapStateProps = Pick<Props, 'selectedAssetPack' | 'selectedCategory' | 'isList' | 'search'>
export type MapDispatchProps = Pick<Props, 'onSetSidebarView' | 'onSelectAssetPack' | 'onSelectCategory' | 'onSearch'>
export type MapDispatch = Dispatch<SetSidebarViewAction | SelectAssetPackAction | SelectCategoryAction | SearchAssetsAction>
