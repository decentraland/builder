import { FullCategory } from 'modules/category/types'
import { addAsset } from 'modules/scene/actions'

export type Props = {
  categories?: FullCategory[]
  isLoading?: boolean
  onAddAsset: typeof addAsset
}

export type MapStateProps = Pick<Props, 'categories' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onAddAsset'>
