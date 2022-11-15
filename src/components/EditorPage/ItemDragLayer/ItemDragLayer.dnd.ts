import { DragLayerCollector, XYCoord } from 'react-dnd'

import { Asset } from 'modules/asset/types'
import { AssetCardDragObject } from 'components/AssetCard/AssetCard.dnd'

export type CollectedProps = {
  currentOffset: XYCoord | null
  isDragging: boolean
  asset: Asset | null
}

export const collect: DragLayerCollector<Record<string, unknown>, CollectedProps> = monitor => {
  const item: AssetCardDragObject | null = monitor.getItem()
  return {
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
    asset: item ? item.asset : null
  }
}
