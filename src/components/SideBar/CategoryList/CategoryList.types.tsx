import { Dispatch } from 'redux'
import { Category } from 'modules/ui/sidebar/types'
import { selectCategory, SelectCategoryAction } from 'modules/ui/sidebar/actions'

export type Props = {
  categories: Category[]
  onSelectCategory: typeof selectCategory
}

export type MapStateProps = Pick<Props, 'categories'>
export type MapDispatchProps = Pick<Props, 'onSelectCategory'>
export type MapDispatch = Dispatch<SelectCategoryAction>
