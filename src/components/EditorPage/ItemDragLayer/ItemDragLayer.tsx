import * as React from 'react'
import { CollectedProps, collect } from './ItemDragLayer.dnd'
import './ItemDragLayer.css'
import { DragLayer } from 'react-dnd'

function getItemStyles(props: CollectedProps) {
  const { currentOffset } = props
  if (!currentOffset) {
    return {
      display: 'none'
    }
  }

  const { x, y } = currentOffset
  const transform = `translate(${x}px, ${y}px)`
  return {
    transform: transform,
    WebkitTransform: transform
  }
}

class ItemDragLayer extends React.PureComponent<CollectedProps> {
  render() {
    const { asset } = this.props
    if (!asset || asset.isDisabled) return null
    const { thumbnail } = asset

    return (
      <div className="ItemDragLayer">
        {thumbnail ? (
          <img className="thumbnail" src={thumbnail} style={getItemStyles(this.props)} alt={asset.name} />
        ) : (
          <div className="thumbnail empty" style={getItemStyles(this.props)} />
        )}
      </div>
    )
  }
}

export default DragLayer(collect)(ItemDragLayer)
