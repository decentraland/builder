import { DragSourceSpec, DragSourceCollector, ConnectDragSource, ConnectDragPreview } from 'react-dnd'

import { Item } from 'modules/item/types'
import { Props } from './ItemCard.types'

export const ITEM_DASHBOARD_CARD_SOURCE = 'ITEM_DASHBOARD_CARD'

export type ItemCardDragObject = {
  item: Item
}

export type CollectedProps = {
  connectDragSource: ConnectDragSource
  connectDragPreview: ConnectDragPreview
  isDragging: boolean
}

export const itemCardSource: DragSourceSpec<Props, ItemCardDragObject> = {
  beginDrag(props) {
    return {
      item: props.item
    }
  }
}

// @ts-ignore
export const collect: DragSourceCollector<CollectedProps> = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}
