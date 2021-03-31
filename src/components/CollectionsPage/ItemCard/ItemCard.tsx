import * as React from 'react'
import { DragSource } from 'react-dnd'
import { Link } from 'react-router-dom'
import { Card } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'
import ItemImage from 'components/ItemImage'
import { Props } from './ItemCard.types'
import { CollectedProps, ITEM_DASHBOARD_CARD_SOURCE, itemCardSource, collect } from './ItemCard.dnd'
import './ItemCard.css'

class ItemCard extends React.PureComponent<Props & CollectedProps> {
  render() {
    const { item, connectDragSource, isDragging } = this.props

    return connectDragSource(
      <div className={`ItemCard is-card ${isDragging ? 'is-dragging' : ''}`}>
        <Link to={locations.itemDetail(item.id)}>
          <ItemImage item={item} />
          <Card.Content>
            <div className="text" title={item.name}>
              {item.name}
            </div>
            <div className="subtitle">{t(`item.type.${item.type}`)}</div>
          </Card.Content>
        </Link>
      </div>
    )
  }
}

export default DragSource<Props, CollectedProps>(ITEM_DASHBOARD_CARD_SOURCE, itemCardSource, collect)(ItemCard)
