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
import { OpenModalAction } from 'modules/modal/actions'

export type Props = {
  selectedAssetPack: AssetPack | null
  selectedCategory: string | null
  isList: boolean
  search: string
  userId: string | null
  onSetSidebarView: typeof setSidebarView
  onSelectAssetPack: typeof selectAssetPack
  onSelectCategory: typeof selectCategory
  onSearch: typeof searchAssets
  onEditAssetPack: (assetPackId: string) => void
}

export type MapStateProps = Pick<Props, 'selectedAssetPack' | 'selectedCategory' | 'isList' | 'search' | 'userId'>
export type MapDispatchProps = Pick<Props, 'onSetSidebarView' | 'onSelectAssetPack' | 'onSelectCategory' | 'onSearch' | 'onEditAssetPack'>
export type MapDispatch = Dispatch<
  SetSidebarViewAction | SelectAssetPackAction | SelectCategoryAction | SearchAssetsAction | OpenModalAction
>
