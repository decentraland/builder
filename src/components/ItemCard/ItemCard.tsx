import * as React from 'react'
import { DragSource } from 'react-dnd'
import { Link } from 'react-router-dom'
import { Card } from 'decentraland-ui'

import { locations } from 'routing/locations'
import ItemImage from './ItemImage'
import { Props } from './ItemCard.types'
import { CollectedProps, ITEM_DASHBOARD_CARD_SOURCE, itemCardSource, collect } from './ItemCard.dnd'
import './ItemCard.css'

class ItemCard extends React.PureComponent<Props & CollectedProps> {
  render() {
    const { item, connectDragSource, isDragging } = this.props

    return connectDragSource(
      <div className={`ui card link ItemCard ${isDragging ? 'is-dragging' : ''}`}>
        <Link to={locations.itemDetail(item.id)} className="ui card link">
          <ItemImage item={item} />
          <Card.Content>
            <div className="text">{item.name}</div>
          </Card.Content>
        </Link>
      </div>
    )
  }
}

export default DragSource<Props, CollectedProps>(ITEM_DASHBOARD_CARD_SOURCE, itemCardSource, collect)(ItemCard)
