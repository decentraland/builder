import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Grid, Dropdown, Icon, Button } from 'decentraland-ui'
import { Link } from 'react-router-dom'

import { locations } from 'routing/locations'
import { preventDefault } from 'lib/preventDefault'
import { isComplete, isEditable, canMint, getMaxSupply } from 'modules/item/utils'
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

  handleMintItem = () => {
    const { onOpenModal, item } = this.props
    onOpenModal('MintItemsModal', { itemIds: [item.id] })
  }

  handleNavigateToEditor = () => {
    const { onNavigate, item } = this.props
    onNavigate(locations.itemEditor({ itemId: item.id, collectionId: item.collectionId }))
  }

  handleRemoveFromCollection = () => {
    const { item, onRemoveFromCollection } = this.props
    onRemoveFromCollection(item!, null)
  }

  hasActions() {
    const { item } = this.props
    return item.isPublished || isComplete(item) || isEditable(item)
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
            <Grid.Column className="avatar-column" width={4}>
              <ItemImage item={item} />
              <div className="info">
                <div className="name-wrapper">
                  <div className="name">{item.name}</div> <ItemBadge item={item} />
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
            {item.isPublished ? (
              <Grid.Column>
                <>
                  <div>
                    {item.totalSupply}/{getMaxSupply(item)}
                  </div>
                  <div className="subtitle">{t('item.supply')}</div>
                </>
              </Grid.Column>
            ) : null}
            <Grid.Column>
              <div className="item-actions">
                {canMint(item) ? (
                  <span onClick={preventDefault(this.handleMintItem)} className="link action">
                    {t('collection_item.mint_item')}
                  </span>
                ) : isComplete(item) ? (
                  <div className="done action">
                    {t('collection_item.done')} <Icon name="check" />
                  </div>
                ) : isEditable(item) ? (
                  <span onClick={preventDefault(this.handleNavigateToEditor)} className="link action">
                    {t('collection_item.edit_item')}
                  </span>
                ) : null}
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
                    {item.isPublished ? (
                      <>
                        <Dropdown.Item text={t('collection_item.edit_price')} onClick={this.handleEditPriceAndBeneficiary} />
                        <Dropdown.Item text={t('collection_item.open_in_editor')} onClick={this.handleNavigateToEditor} />
                      </>
                    ) : (
                      <Dropdown.Item text={t('collection_item.remove_from_collection')} onClick={this.handleRemoveFromCollection} />
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Link>
    )
  }
}
