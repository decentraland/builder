import React from 'react'
import { ethers } from 'ethers'
import { EmoteDataADR74, Network, WearableCategory } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Dropdown, Icon, Button, Mana, Table, Popup } from 'decentraland-ui'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { preventDefault } from 'lib/event'
import { isComplete, isFree, canManageItem, getMaxSupply } from 'modules/item/utils'
import ItemStatus from 'components/ItemStatus'
import { isLocked } from 'modules/collection/utils'
import { isEmoteData, ItemType, SyncStatus, WearableData } from 'modules/item/types'
import { FromParam } from 'modules/location/types'
import ItemBadge from 'components/ItemBadge'
import RarityBadge from 'components/RarityBadge'
import ItemImage from 'components/ItemImage'
import { Props } from './CollectionItem.types'
import ResetItemButton from './ResetItemButton'
import styles from './CollectionItem.module.css'

export default class CollectionItem extends React.PureComponent<Props> {
  handleEditPriceAndBeneficiary = () => {
    const { onOpenModal, item } = this.props
    onOpenModal('EditPriceAndBeneficiaryModal', { itemId: item.id })
  }

  handleSeeInWorld = () => {
    const { onOpenModal, item } = this.props
    onOpenModal('SeeInWorldModal', { itemIds: [item.id] })
  }

  handleMintItem = () => {
    const { onOpenModal, item } = this.props
    onOpenModal('MintItemsModal', { itemIds: [item.id] })
  }

  handleNavigateToEditor = () => {
    const { onNavigate, item, onSetItems } = this.props
    onSetItems([item])
    onNavigate(locations.itemEditor({ itemId: item.id, collectionId: item.collectionId }), { fromParam: FromParam.COLLECTIONS })
  }

  handleDeleteItem = () => {
    const { item, onOpenModal } = this.props
    onOpenModal('DeleteItemModal', { item })
  }

  handleMoveToAnotherCollection = () => {
    const { collection, item, onOpenModal } = this.props
    onOpenModal('MoveItemToAnotherCollectionModal', { item, fromCollection: collection })
  }

  renderPrice() {
    const { item } = this.props

    return item.price ? (
      <div>
        {isFree(item) ? (
          t('global.free')
        ) : (
          <Mana className={styles.mana} network={Network.MATIC} showTooltip>
            {ethers.utils.formatEther(item.price)}
          </Mana>
        )}
      </div>
    ) : (
      <div className={`link ${styles.linkAction}`} onClick={preventDefault(this.handleEditPriceAndBeneficiary)}>
        {t('collection_item.set_price')}
      </div>
    )
  }

  renderItemStatus() {
    const { item, status } = this.props

    return status === SyncStatus.UNSYNCED ? (
      <div className={`${styles.unsynced} ${styles.action}`}>
        <div className={styles.alertIcon} />
        {t('collection_item.unsynced')}
      </div>
    ) : status === SyncStatus.UNDER_REVIEW || (item.isPublished && !item.isApproved) ? (
      <div className={`${styles.notReady} ${styles.action}`}>
        <Icon name="clock outline" />
        {t('collection_item.under_review')}
      </div>
    ) : item.isPublished && item.isApproved ? (
      <div className={`${styles.published} ${styles.action}`}>
        <Icon name="check circle outline" />
        {t('collection_item.published')}
      </div>
    ) : isComplete(item) ? (
      <div className={`${styles.ready} ${styles.action}`}>
        <Icon className={styles.check} name="check" />
        {t('collection_item.ready')}
      </div>
    ) : !item.price ? (
      <div className={`${styles.notReady} ${styles.action}`}>{t('collection_item.not_ready')}</div>
    ) : (
      <span onClick={preventDefault(this.handleNavigateToEditor)} className={`link ${styles.linkAction}`}>
        {t('collection_item.edit_item')}
      </span>
    )
  }

  renderItemContextMenu() {
    const { collection, item, ethAddress } = this.props

    return (
      <div className={styles.itemActions}>
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
          <Dropdown.Menu className={styles.contextMenu}>
            <Dropdown.Item text={t('collection_item.see_details')} as={Link} to={locations.itemDetail(item.id)} />
            <Dropdown.Item text={t('collection_context_menu.see_in_world')} onClick={this.handleSeeInWorld} />
            <Dropdown.Item text={t('collection_item.preview')} onClick={this.handleNavigateToEditor} />
            {!collection.isPublished && (
              <Dropdown.Item text={t('collection_item.move_to_another_collection')} onClick={this.handleMoveToAnotherCollection} />
            )}
            {canManageItem(collection, item, ethAddress) && !isLocked(collection) ? (
              <>
                {item.price ? <Dropdown.Item text={t('collection_item.edit_price')} onClick={this.handleEditPriceAndBeneficiary} /> : null}
                <ResetItemButton itemId={item.id} />
                {!item.isPublished ? (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item text={t('collection_item.delete_item')} onClick={this.handleDeleteItem} />
                  </>
                ) : null}
              </>
            ) : null}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }

  render() {
    const { item } = this.props
    const data = item.data as EmoteDataADR74 | WearableData

    return (
      <Table.Row className={`CollectionItem ${styles.row}`}>
        <Table.Cell className={`${styles.avatarColumn}`} width={5}>
          <Link to={locations.itemDetail(item.id)} className="CollectionItem">
            <div className={styles.avatarContainer}>
              <ItemImage className={styles.itemImage} item={item} />

              <div className={styles.info}>
                <div className={styles.nameWrapper}>
                  <div className={styles.name} title={item.name}>
                    <ItemStatus className={styles.itemStatus} item={item} />
                    {item.name}
                    <div className={styles.badgeContainer}>
                      <ItemBadge className={styles.badge} item={item} size="small"></ItemBadge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </Table.Cell>
        <Table.Cell className={styles.column}>
          {item.rarity && data.category ? <RarityBadge category={data.category as WearableCategory} rarity={item.rarity} /> : null}
        </Table.Cell>
        <Table.Cell className={styles.column}>{data.category ? <div>{t(`${item.type}.category.${data.category}`)}</div> : null}</Table.Cell>
        {item.type === ItemType.EMOTE && isEmoteData(data) ? (
          <Table.Cell className={styles.column}>
            {data.category ? <div>{t(`emote.play_mode.${data.loop ? 'loop' : 'simple'}.text`)}</div> : null}
          </Table.Cell>
        ) : null}
        <Table.Cell className={styles.column}>{this.renderPrice()}</Table.Cell>
        {item.isPublished && item.isApproved ? (
          <Table.Cell className={styles.column}>
            <div>
              {item.totalSupply}/{getMaxSupply(item)}
            </div>
          </Table.Cell>
        ) : null}
        <Table.Cell>
          <Popup
            className={styles.contextMenuButton}
            trigger={this.renderItemStatus()}
            content={this.renderItemContextMenu()}
            inverted
            basic
            offset={[0, -60]}
            position="right center"
            hoverable
          />
        </Table.Cell>
      </Table.Row>
    )
  }
}
