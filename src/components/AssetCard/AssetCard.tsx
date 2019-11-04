import * as React from 'react'
import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

import { Asset } from 'modules/asset/types'
import { Props, DefaultProps } from './AssetCard.types'
import VerticalCard from './VerticalCard'
import HorizontalCard from './HorizontalCard'
import { ASSET_TYPE, collect, assetSource, CollectedProps } from './AssetCard.dnd'

import './AssetCard.css'

class AssetCard extends React.PureComponent<Props & CollectedProps> {
  static defaultProps: DefaultProps = {
    onClick: (_: Asset) => {
      /* noop */
    },
    onBeginDrag: (_: Asset) => {
      /* noop */
    }
  }

  componentWillMount() {
    this.props.connectDragPreview(getEmptyImage())
  }

  handleClick = () => {
    const { asset, onClick } = this.props
    if (!asset.isDisabled) {
      onClick(asset)
    }
  }

  render() {
    const { isHorizontal, asset, connectDragSource, isDragging } = this.props
    return connectDragSource(
      <div onClick={this.handleClick} data-asset-id={asset.id}>
        {isHorizontal ? <HorizontalCard asset={asset} isDragging={isDragging} /> : <VerticalCard asset={asset} isDragging={isDragging} />}
      </div>
    )
  }
}

export default DragSource<Props, CollectedProps>(ASSET_TYPE, assetSource, collect)(AssetCard)
