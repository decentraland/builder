import { Dispatch } from 'redux'

import { Category } from 'modules/ui/sidebar/types'
import { addItem, AddItemAction } from 'modules/scene/actions'
import { searchAssets, SearchAssetsAction } from 'modules/ui/sidebar/actions'

export type Props = {
  categories?: Category[]
  isLoading?: boolean
  onAddItem: typeof addItem
  onSearch: typeof searchAssets
}

export type MapStateProps = Pick<Props, 'categories' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onAddItem' | 'onSearch'>
export type MapDispatch = Dispatch<AddItemAction | SearchAssetsAction>
