import { Dispatch } from 'redux'

import { AssetPack } from 'modules/assetPack/types'
import {
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
  userId: string | null

  onSelectAssetPack: typeof selectAssetPack
  onSelectCategory: typeof selectCategory
  onSearch: typeof searchAssets

  onEditAssetPack: (assetPackId: string) => void
  onCreateAssetPack: () => void
}

export type MapStateProps = Pick<Props, 'selectedAssetPack' | 'selectedCategory' | 'search' | 'userId'>
export type MapDispatchProps = Pick<Props, 'onSelectAssetPack' | 'onSelectCategory' | 'onSearch' | 'onEditAssetPack' | 'onCreateAssetPack'>
export type MapDispatch = Dispatch<SelectAssetPackAction | SelectCategoryAction | SearchAssetsAction | OpenModalAction>
