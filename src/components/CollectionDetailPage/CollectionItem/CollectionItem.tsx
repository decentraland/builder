import * as React from 'react'
import { Grid } from 'decentraland-ui'
import { Link } from 'react-router-dom'

import { locations } from 'routing/locations'
import { WearableData } from 'modules/item/types'
import ItemImage from 'components/ItemCard/ItemImage'
import { Props } from './CollectionItem.types'
import './CollectionItem.css'

export default class CollectionItem extends React.PureComponent<Props> {
  render() {
    const { item } = this.props
    const data = item.data as WearableData

    return (
      <Link to={locations.itemDetail(item.id)} className="CollectionItem">
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column className="avatar-column" width={4}>
              <ItemImage item={item} />
              <div>{item.name}</div>
            </Grid.Column>
            <Grid.Column>
              <div>{data.category}</div>
              <div className="subtitle">Category</div>
            </Grid.Column>
            <Grid.Column>
              <div>{item.rarity}</div>
              <div className="subtitle">Rarity</div>
            </Grid.Column>
            <Grid.Column>
              <div>{item.price}</div>
              <div className="subtitle">Price</div>
            </Grid.Column>
            <Grid.Column>Actions</Grid.Column>
          </Grid.Row>
        </Grid>
      </Link>
    )
  }
}
