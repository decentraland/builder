import { Dispatch } from 'redux'
import { GridProps } from 'decentraland-ui'

import { Category } from 'modules/ui/sidebar/types'
import { Project } from 'modules/project/types'
import { addItem, setGround, AddItemAction, SetGroundAction } from 'modules/scene/actions'
import { prefetchAsset, PrefetchAssetAction } from 'modules/editor/actions'

export type DefaultProps = {
  columnCount: GridProps['columns']
}

export type Props = DefaultProps & {
  category: Category
  currentProject: Project | null
  isList: boolean
  hasLabel: boolean
  onAddItem: typeof addItem
  onSetGround: typeof setGround
  onPrefetchAsset: typeof prefetchAsset
}

export type MapStateProps = Pick<Props, 'isList' | 'currentProject'>
export type MapDispatchProps = Pick<Props, 'onAddItem' | 'onSetGround' | 'onPrefetchAsset'>
export type MapDispatch = Dispatch<AddItemAction | SetGroundAction | PrefetchAssetAction>
