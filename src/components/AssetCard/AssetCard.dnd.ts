import { DragSourceSpec, DragSourceCollector, ConnectDragSource, ConnectDragPreview } from 'react-dnd'

import { Asset } from 'modules/asset/types'
import { Props } from './AssetCard.types'

export const ASSET_TYPE = 'ASSET'

export type AssetCardDragObject = {
  asset: Asset
}

export type CollectedProps = {
  connectDragSource: ConnectDragSource
  connectDragPreview: ConnectDragPreview
  isDragging: boolean
}

export const assetSource: DragSourceSpec<Props, AssetCardDragObject> = {
  beginDrag(props) {
    props.onBeginDrag(props.asset)
    return {
      asset: props.asset
    }
  },
  canDrag(props) {
    return !props.asset.isDisabled
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const collect: DragSourceCollector<CollectedProps> = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}
