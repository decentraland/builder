import * as React from 'react'
import { Grid, Icon } from 'decentraland-ui'
import { Link } from 'react-router-dom'

import { locations } from 'routing/locations'
import { WearableData } from 'modules/item/types'
import ItemBadge from 'components/ItemBadge'
import ItemImage from 'components/ItemCard/ItemImage'
import { Props } from './CollectionItem.types'
import './CollectionItem.css'

export default class CollectionItem extends React.PureComponent<Props> {
  isDone() {
    const { item } = this.props
    return !this.isEditable() && item.price
  }

  isEditable() {
    const { item } = this.props
    const data = item.data as WearableData
    return !item.rarity || !data.category
  }

  renderPrice() {
    const { item } = this.props

    return item.price ? (
      <>
        <div>{item.price}</div>
        <div className="subtitle">price</div>
      </>
    ) : !this.isEditable() ? (
      <>
        <div className="link">set price</div>
        <div className="subtitle">price</div>
      </>
    ) : null
  }

  render() {
    const { item } = this.props
    const data = item.data as WearableData

    return (
      <Link to={locations.itemDetail(item.id)} className="CollectionItem">
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column className="avatar-column" width={5}>
              <ItemImage item={item} />
              <div>
                <div className="name">
                  {item.name} <ItemBadge item={item} />
                </div>
                <div className="subtitle">{item.type}</div>
              </div>
            </Grid.Column>
            <Grid.Column>
              {data.category ? (
                <>
                  <div>{data.category}</div>
                  <div className="subtitle">Category</div>
                </>
              ) : null}
            </Grid.Column>
            <Grid.Column>
              {item.rarity ? (
                <>
                  <div>{item.rarity}</div>
                  <div className="subtitle">Rarity</div>
                </>
              ) : null}
            </Grid.Column>
            <Grid.Column>{this.renderPrice()}</Grid.Column>
            <Grid.Column>
              {this.isDone() ? (
                <div className="done">
                  Done
                  <Icon name="check" />
                </div>
              ) : this.isEditable() ? (
                <Link to={locations.itemEditor(item.id)} className="edit-item">
                  edit item
                </Link>
              ) : null}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Link>
    )
  }
}
