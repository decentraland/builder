import { DropTargetSpec, DropTargetCollector, ConnectDropTarget } from 'react-dnd'

import { AssetCardDragObject } from 'components/AssetCard/AssetCard.dnd'
import { Props } from './Preview.types'

export const PREVIEW_OFFSET = {
  x: 0,
  y: 48
}

export type CollectedProps = {
  connectDropTarget: ConnectDropTarget
  canDrop: boolean
  isOver: boolean
}

export const previewTarget: DropTargetSpec<Props> = {
  drop(props, monitor) {
    const item: AssetCardDragObject = monitor.getItem()
    const offset = monitor.getClientOffset()
    if (!offset) return
    props.onDropItem(item.asset, offset.x - PREVIEW_OFFSET.x, offset.y - PREVIEW_OFFSET.y)
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const collect: DropTargetCollector<CollectedProps> = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver()
  }
}
