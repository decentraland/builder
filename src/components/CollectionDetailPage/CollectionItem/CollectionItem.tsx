import React from 'react'
import { Network } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Grid, Dropdown, Icon, Button, Mana } from 'decentraland-ui'
import { Link } from 'react-router-dom'
import { fromWei } from 'web3x/utils'
import { locations } from 'routing/locations'
import { preventDefault } from 'lib/preventDefault'
import { isComplete, isFree, canMintItem, canManageItem, getMaxSupply } from 'modules/item/utils'
import ItemStatus from 'components/ItemStatus'
import { isLocked } from 'modules/collection/utils'
import { WearableData } from 'modules/item/types'
import ItemImage from 'components/ItemImage'
import { Props } from './CollectionItem.types'
import ResetItemButton from './ResetItemButton'
import * as styles from './CollectionItem.module.css'

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

  renderPrice() {
    const { item } = this.props

    return item.price ? (
      <>
        <div>
          {isFree(item) ? (
            t('global.free')
          ) : (
            <Mana className={styles.mana} network={Network.MATIC}>
              {fromWei(item.price, 'ether')}
            </Mana>
          )}
        </div>
        <div className={styles.subtitle}>{t('item.price')}</div>
      </>
    ) : (
      <>
        <div className={`link ${styles.linkAction}`} onClick={preventDefault(this.handleEditPriceAndBeneficiary)}>
          {t('collection_item.set_price')}
        </div>
        <div className={styles.subtitle}>{t('item.price')}</div>
      </>
    )
  }

  render() {
    const { collection, item, ethAddress } = this.props
    const data = item.data as WearableData

    return (
      <Link to={locations.itemDetail(item.id)} className="CollectionItem">
        <Grid className={styles.grid} columns="equal">
          <Grid.Row className={styles.row}>
            <Grid.Column className={`${styles.column} ${styles.avatarColumn}`} width={5}>
              <ItemImage className={styles.itemImage} item={item} hasBadge badgeSize="small" />
              <div className={styles.info}>
                <div className={styles.nameWrapper}>
                  <div className={styles.name} title={item.name}>
                    <ItemStatus className={styles.itemStatus} item={item} />
                    {item.name}
                  </div>
                </div>
                <div className={styles.subtitle}>{item.type}</div>
              </div>
            </Grid.Column>
            <Grid.Column className={styles.column}>
              {data.category ? (
                <>
                  <div>{t(`${item.type}.category.${data.category}`)}</div>
                  <div className={styles.subtitle}>{t('item.category')}</div>
                </>
              ) : null}
            </Grid.Column>
            <Grid.Column className={styles.column}>
              {item.rarity ? (
                <>
                  <div>{t(`wearable.rarity.${item.rarity}`)}</div>
                  <div className={styles.subtitle}>{t('item.rarity')}</div>
                </>
              ) : null}
            </Grid.Column>
            <Grid.Column className={styles.column}>{this.renderPrice()}</Grid.Column>
            {item.isPublished ? (
              <Grid.Column className={styles.column}>
                <>
                  <div>
                    {item.totalSupply}/{getMaxSupply(item)}
                  </div>
                  <div className={styles.subtitle}>{t('item.supply')}</div>
                </>
              </Grid.Column>
            ) : null}
            <Grid.Column className={styles.column}>
              <div className={styles.itemActions}>
                {canMintItem(collection, item, ethAddress) ? (
                  <span onClick={preventDefault(this.handleMintItem)} className={`link ${styles.linkAction} ${styles.action}`}>
                    {t('collection_item.mint_item')}
                  </span>
                ) : isComplete(item) ? (
                  <div className={`${styles.done} ${styles.action}`}>
                    {t('collection_item.done')} <Icon className={styles.check} name="check" />
                  </div>
                ) : (
                  <span onClick={preventDefault(this.handleNavigateToEditor)} className={`link ${styles.linkAction} ${styles.action}`}>
                    {t('collection_item.edit_item')}
                  </span>
                )}
                <Dropdown
                  trigger={
                    <Button basic>
                      <Icon name="ellipsis horizontal" />
                    </Button>
                  }
                  inline
                  direction="left"
                  className={styles.action}
                  onClick={preventDefault()}
                >
                  <Dropdown.Menu>
                    <Dropdown.Item text={t('collection_item.see_details')} as={Link} to={locations.itemDetail(item.id)} />
                    <Dropdown.Item text={t('global.open_in_editor')} onClick={this.handleNavigateToEditor} />
                    {canManageItem(collection, item, ethAddress) && !isLocked(collection) ? (
                      <>
                        {item.price ? (
                          <Dropdown.Item text={t('collection_item.edit_price')} onClick={this.handleEditPriceAndBeneficiary} />
                        ) : null}
                        {!item.isPublished ? (
                          <Dropdown.Item text={t('collection_item.remove_from_collection')} onClick={this.handleRemoveFromCollection} />
                        ) : null}
                        <ResetItemButton itemId={item.id} />
                      </>
                    ) : null}
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
