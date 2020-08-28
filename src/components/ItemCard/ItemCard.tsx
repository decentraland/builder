import * as React from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'decentraland-ui'

import { locations } from 'routing/locations'
import ItemImage from './ItemImage'
import { Props } from './ItemCard.types'
import './ItemCard.css'

export default class ItemCard extends React.PureComponent<Props> {
  render() {
    const { item } = this.props

    return (
      <Card className="ItemCard" link as={Link} to={locations.item(item.id)}>
        <ItemImage item={item} />
        <Card.Content>
          <div className="text">{item.name}</div>
        </Card.Content>
      </Card>
    )
  }
}
