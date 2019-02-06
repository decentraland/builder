import * as React from 'react'
import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

import { Asset } from 'modules/asset/types'
import { Props } from './AssetCard.types'
import VerticalCard from './VerticalCard'
import HorizontalCard from './HorizontalCard'
import { ASSET_TYPE, collect, assetSource, CollectedProps } from './AssetCard.dnd'

class AssetCard extends React.PureComponent<Props & CollectedProps> {
  static defaultProps = {
    onClick: (_: Asset) => {
      /* noop */
    }
  }

  componentWillMount() {
    this.props.connectDragPreview(getEmptyImage())
  }

  handleOnClick = () => {
    const { asset, onClick } = this.props
    onClick(asset)
  }

  render() {
    const { isHorizontal, asset, connectDragSource, isDragging, isOverTarget } = this.props
    return connectDragSource(
      <div onClick={this.handleOnClick}>
        {isHorizontal ? (
          <HorizontalCard asset={asset} isDragging={isDragging} isOverTarget={isOverTarget} />
        ) : (
          <VerticalCard asset={asset} isDragging={isDragging} isOverTarget={isOverTarget} />
        )}
      </div>
    )
  }
}

export default DragSource(ASSET_TYPE, assetSource, collect)(AssetCard)
