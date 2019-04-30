import { Dispatch } from 'redux'
import { Category } from 'modules/ui/sidebar/types'
import { AssetPack } from 'modules/assetPack/types'

export type Props = {
  categories: Category[]
  selectedAssetPack: AssetPack | null
  selectedCategory: string | null
  search: string
  isList: boolean
}

export type MapStateProps = Pick<Props, 'categories' | 'selectedAssetPack' | 'selectedCategory' | 'search' | 'isList'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch

export type State = {
  search: string
}
