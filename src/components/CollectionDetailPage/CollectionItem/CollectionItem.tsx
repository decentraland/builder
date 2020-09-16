import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Grid, Dropdown, Icon, Button } from 'decentraland-ui'
import { Link } from 'react-router-dom'

import { locations } from 'routing/locations'
import { preventDefault } from 'lib/preventDefault'
import { isComplete, isEditable } from 'modules/item/utils'
import { WearableData } from 'modules/item/types'
import ItemBadge from 'components/ItemBadge'
import ItemImage from 'components/ItemImage'
import { Props } from './CollectionItem.types'
import './CollectionItem.css'

export default class CollectionItem extends React.PureComponent<Props> {
  handleEditPriceAndBeneficiary = () => {
    const { onOpenModal, item } = this.props
    onOpenModal('EditPriceAndBeneficiaryModal', { itemId: item.id })
  }

  handleNavigateToEditor = () => {
    const { onNavigate, item } = this.props
    onNavigate(locations.itemEditor({ itemId: item.id }))
  }

  handleRemoveFromCollection = () => {
    const { item, onRemoveFromCollection } = this.props
    onRemoveFromCollection(item!, null)
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
        <div className="link" onClick={preventDefault(this.handleEditPriceAndBeneficiary)}>
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
              <div className="item-actions">
                {isComplete(item) ? (
                  <div className="done">
                    {t('collection_item.done')} <Icon name="check" />
                  </div>
                ) : isEditable(item) ? (
                  <span onClick={preventDefault(this.handleNavigateToEditor)} className="link edit-item action">
                    {t('collection_item.edit_item')}
                  </span>
                ) : null}
                {isComplete(item) || isEditable(item) ? (
                  <Dropdown
                    trigger={
                      <Button basic>
                        <Icon name="ellipsis horizontal" />
                      </Button>
                    }
                    inline
                    direction="left"
                    className="action"
                    onClick={preventDefault()}
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item text={t('collection_item.remove_from_collection')} onClick={this.handleRemoveFromCollection} />
                    </Dropdown.Menu>
                  </Dropdown>
                ) : null}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Link>
    )
  }
}
