import { SidebarItemDragObject } from '../../Items/SidebarItem/SidebarItem.dnd'
import { ConnectDropTarget, DropTargetSpec } from 'react-dnd'
import { Props } from './SidebarCollection.types'

export type CollectedProps = {
  connectDropTarget: ConnectDropTarget
  canDrop: boolean
  isOver: boolean
}

export const collectionTarget: DropTargetSpec<Props> = {
  drop(props, monitor) {
    const { item }: SidebarItemDragObject = monitor.getItem()
    props.onSetCollection(item, props.collection.id)
  },
  canDrop(props) {
    return !props.collection.isPublished
  }
}

// @ts-ignore
export const collect: DropTargetCollector<CollectedProps> = (connect, monitor, props: Props) => {
  return {
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver()
  }
}
