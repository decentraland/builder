import * as React from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'decentraland-ui'

import { locations } from 'routing/locations'
import { Item } from 'modules/item/types'
import ItemImage from '../ItemCard/ItemImage'
import { Props } from './CollectionCard.types'
import './CollectionCard.css'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { DropTarget } from 'react-dnd'
import { collect, CollectedProps, collectionTarget } from './CollectionCard.dnd'
import { ITEM_DASHBOARD_CARD_SOURCE } from 'components/ItemCard/ItemCard.dnd'

class CollectionCard extends React.PureComponent<Props & CollectedProps> {
  renderItemRow(items: Item[]) {
    return items.map((item, index) => <ItemImage key={index} item={item} />)
  }

  render() {
    const { collection, items, connectDropTarget, isOver } = this.props

    const firstItemRow = items.slice(0, 2)
    const secondItemRow = items.slice(2, 4)
    const itemRowStyle = { height: secondItemRow.length ? '50%' : '100%' }

    return connectDropTarget(
      <div className={`ui card link CollectionCard ${isOver ? 'is-over' : ''}`}>
        <Link to={locations.collectionDetail(collection.id)} className="ui card link">
          <div className="item-rows">
            {items.length === 0 ? (
              <div className="item-row empty">
                <div className="sparkles" />
                <div>{t('collection_card.add_item')}</div>
              </div>
            ) : null}
            {firstItemRow.length > 0 ? (
              <div className="item-row" style={itemRowStyle}>
                {this.renderItemRow(firstItemRow)}
              </div>
            ) : null}
            {secondItemRow.length > 0 ? (
              <div className="item-row" style={itemRowStyle}>
                {this.renderItemRow(secondItemRow)}
              </div>
            ) : null}
          </div>
          <Card.Content>
            <div className="text">{collection.name}</div>
          </Card.Content>
        </Link>
      </div>
    )
  }
}

export default DropTarget<Props, CollectedProps>(ITEM_DASHBOARD_CARD_SOURCE, collectionTarget, collect)(CollectionCard)
