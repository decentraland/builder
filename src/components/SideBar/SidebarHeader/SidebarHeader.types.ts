import { Dispatch } from 'redux'

import { AssetPack } from 'modules/assetPack/types'
import {
  setSidebarView,
  selectCategory,
  selectAssetPack,
  SetSidebarViewAction,
  SelectAssetPackAction,
  SelectCategoryAction
} from 'modules/ui/sidebar/actions'

export type Props = {
  selectedAssetPack: AssetPack | null
  selectedCategory: string | null
  isList: boolean
  onSetSidebarView: typeof setSidebarView
  onSelectAssetPack: typeof selectAssetPack
  onSelectCategory: typeof selectCategory
}

export type MapStateProps = Pick<Props, 'selectedAssetPack' | 'selectedCategory' | 'isList'>
export type MapDispatchProps = Pick<Props, 'onSetSidebarView' | 'onSelectAssetPack' | 'onSelectCategory'>
export type MapDispatch = Dispatch<SetSidebarViewAction | SelectAssetPackAction | SelectCategoryAction>
