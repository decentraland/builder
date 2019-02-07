import { DragLayerCollector, XYCoord } from 'react-dnd'

import { Asset } from 'modules/asset/types'
import { DragObject } from 'components/AssetCard/AssetCard.dnd'

export type CollectedProps = {
  currentOffset: XYCoord | null
  isDragging: boolean
  asset: Asset | null
}

export const collect: DragLayerCollector<{}, CollectedProps> = monitor => {
  const item: DragObject | null = monitor.getItem()
  return {
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
    asset: item ? item.asset : null
  }
}
