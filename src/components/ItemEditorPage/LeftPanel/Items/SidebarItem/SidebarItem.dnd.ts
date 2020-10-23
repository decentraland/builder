import { DragSourceSpec, DragSourceCollector, ConnectDragSource, ConnectDragPreview } from 'react-dnd'

import { Item } from 'modules/item/types'
import { Props } from './SidebarItem.types'

export const SIDEBAR_ITEM_SOURCE = 'SIDEBAR_ITEM_SOURCE'

export type SidebarItemDragObject = {
  item: Item
}

export type CollectedProps = {
  connectDragSource: ConnectDragSource
  connectDragPreview: ConnectDragPreview
  isDragging: boolean
}

export const sidebarItemSource: DragSourceSpec<Props, SidebarItemDragObject> = {
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
