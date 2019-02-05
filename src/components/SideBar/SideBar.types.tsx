import { Dispatch } from 'redux'

import { Category } from 'modules/ui/sidebar/types'
import { addItem, AddItemAction } from 'modules/scene/actions'

export type Props = {
  categories?: Category[]
  isLoading?: boolean
  onAddItem: typeof addItem
}

export type MapStateProps = Pick<Props, 'categories' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onAddItem'>
export type MapDispatch = Dispatch<AddItemAction>
