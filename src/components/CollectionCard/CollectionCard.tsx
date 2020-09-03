import * as React from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'decentraland-ui'

import { locations } from 'routing/locations'
import { Item } from 'modules/item/types'
import ItemImage from '../ItemCard/ItemImage'
import { Props } from './CollectionCard.types'
import './CollectionCard.css'

export default class CollectionCard extends React.PureComponent<Props> {
  renderItemRow(items: Item[]) {
    return items.map((item, index) => <ItemImage key={index} item={item} />)
  }

  render() {
    const { collection, items } = this.props

    const firstItemRow = items.slice(0, 2)
    const secondItemRow = items.slice(2, 4)
    const itemRowStyle = { height: secondItemRow.length ? '50%' : '100%' }

    return (
      <Card className="CollectionCard" link as={Link} to={locations.collectionDetail(collection.id)}>
        <div className="item-rows">
          {items.length === 0 ? (
            <div className="item-row empty">
              <div className="sparkles" />
              <div>Add Item</div>
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
      </Card>
    )
  }
}
