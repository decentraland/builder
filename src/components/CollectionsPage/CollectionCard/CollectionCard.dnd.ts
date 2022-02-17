import { ConnectDropTarget, DropTargetSpec } from 'react-dnd'
import { CollectionType } from 'modules/collection/types'
import { getCollectionType } from 'modules/collection/utils'
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
    const isThirdParty = getCollectionType(props.collection) === CollectionType.THIRD_PARTY
    return !props.collection.isPublished && !isThirdParty
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
