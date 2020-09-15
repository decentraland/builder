import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Grid, Dropdown, Icon, Button } from 'decentraland-ui'
import { Link } from 'react-router-dom'

import { locations } from 'routing/locations'
import { preventDefault } from 'lib/preventDefault'
import { isComplete, isEditable } from 'modules/item/utils'
import { WearableData, RARITY_MAX_SUPPLY } from 'modules/item/types'
import ItemBadge from 'components/ItemBadge'
import ConfirmDelete from 'components/ConfirmDelete'
import ItemImage from 'components/ItemCard/ItemImage'
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
    onNavigate(locations.itemEditor(item.id))
  }

  handleDeleteItem = () => {
    const { item, onDelete } = this.props
    onDelete(item!)
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
            {item.isPublished ? (
              <Grid.Column>
                <>
                  <div>
                    {item.totalSupply}/{RARITY_MAX_SUPPLY[item.rarity!]}
                  </div>
                  <div className="subtitle">{t('item.supply')}</div>
                </>
              </Grid.Column>
            ) : null}
            <Grid.Column>
              <div className="item-actions">
                {item.isPublished ? (
                  <span onClick={preventDefault(this.handleMintItem)} className="link action">
                    {t('collection_item.mint_item')}
                  </span>
                ) : isComplete(item) ? (
                  <div className="done">
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
                      <ConfirmDelete
                        name={item.name}
                        onDelete={this.handleDeleteItem}
                        trigger={<Dropdown.Item text={t('global.delete')} />}
                      />
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
