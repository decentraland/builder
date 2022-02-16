import { ConnectDropTarget, DropTargetSpec } from 'react-dnd'
import { isThirdParty } from 'lib/urn'
import { ItemCardDragObject } from '../ItemCard/ItemCard.dnd'
import { Props } from './CollectionCard.types'

export type CollectedProps = {
  connectDropTarget: ConnectDropTarget
  canDrop: boolean
  isOver: boolean
}

export const collectionTarget: DropTargetSpec<Props> = {
  drop(props, monitor) {
    const { item }: ItemCardDragObject = monitor.getItem()
    props.onSetCollection(item, props.collection.id)
  },
  canDrop(props) {
    return !props.collection.isPublished && !isThirdParty(props.collection.urn)
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
