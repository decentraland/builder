import * as React from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'decentraland-ui'

import { locations } from 'routing/locations'
import { Item } from 'modules/item/types'
import ItemImage from '../ItemCard/ItemImage'
import { Props } from './CollectionCard.types'
import './CollectionCard.css'

const ITEM_IMAGE_SIZE = 248

export default class CollectionCard extends React.PureComponent<Props> {
  renderItemRow(items: Item[]) {
    return items.map((item, index) => <ItemImage key={index} item={item} />)
  }

  render() {
    const { collection, items } = this.props

    const firstItemRow = items.slice(0, 2)
    const secondItemRow = items.slice(2, 4)
    const itemRowStyle = { height: secondItemRow.length ? ITEM_IMAGE_SIZE / 2 : ITEM_IMAGE_SIZE }

    return (
      <Card className="CollectionCard" link as={Link} to={locations.collection(collection.id)}>
        <div className="item-rows">
          <div className="item-row" style={itemRowStyle}>
            {this.renderItemRow(firstItemRow)}
          </div>
          <div className="item-row" style={itemRowStyle}>
            {this.renderItemRow(secondItemRow)}
          </div>
        </div>
        <Card.Content>
          <div className="text">{collection.name}</div>
        </Card.Content>
      </Card>
    )
  }
}
