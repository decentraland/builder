import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Grid, Icon } from 'decentraland-ui'
import { Link } from 'react-router-dom'

import { locations } from 'routing/locations'
import { isComplete, isEditable } from 'modules/item/utils'
import { WearableData } from 'modules/item/types'
import ItemBadge from 'components/ItemBadge'
import ItemImage from 'components/ItemCard/ItemImage'
import { Props } from './CollectionItem.types'
import './CollectionItem.css'

export default class CollectionItem extends React.PureComponent<Props> {
  handleEditItem = () => {
    const { onOpenModal } = this.props
    onOpenModal('EditItemModal')
  }

  renderPrice() {
    const { item } = this.props

    return item.price ? (
      <>
        <div>{item.price}</div>
        <div className="subtitle">{t('item.price')}</div>
      </>
    ) : !isEditable(item) ? (
      <>
        <div className="link" onClick={this.handleEditItem}>
          {t('collection_item.set_price')}
        </div>
        <div className="subtitle">{t('item.price')}</div>
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
                  <div className="subtitle">{t('item.category')}</div>
                </>
              ) : null}
            </Grid.Column>
            <Grid.Column>
              {item.rarity ? (
                <>
                  <div>{item.rarity}</div>
                  <div className="subtitle">{t('item.rarity')}</div>
                </>
              ) : null}
            </Grid.Column>
            <Grid.Column>{this.renderPrice()}</Grid.Column>
            <Grid.Column>
              {isComplete(item) ? (
                <div className="done">
                  {t('collection_item.done')} <Icon name="check" />
                </div>
              ) : isEditable(item) ? (
                <Link to={locations.itemEditor(item.id)} className="edit-item">
                  {t('collection_item.edit_item')}
                </Link>
              ) : null}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Link>
    )
  }
}
