import { Dispatch } from 'redux'

import { Category } from 'modules/ui/sidebar/types'
import { addAsset, AddAssetAction } from 'modules/scene/actions'

export type Props = {
  categories?: Category[]
  isLoading?: boolean
  onAddAsset: typeof addAsset
}

export type MapStateProps = Pick<Props, 'categories' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onAddAsset'>
export type MapDispatch = Dispatch<AddAssetAction>
