import React from 'react'
import { ethers } from 'ethers'
import { EmoteDataADR74, Network } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { RarityBadge } from 'decentraland-dapps/dist/containers/RarityBadge'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { Dropdown, Icon, Button, Mana, Table } from 'decentraland-ui'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { preventDefault } from 'lib/event'
import { extractThirdPartyTokenId, extractTokenId, isThirdParty } from 'lib/urn'
import { isComplete, isFree, canManageItem, getMaxSupply, isSmart } from 'modules/item/utils'
import { isLocked } from 'modules/collection/utils'
import { isEmoteData, ItemType, SyncStatus, VIDEO_PATH, WearableData } from 'modules/item/types'
import { FromParam } from 'modules/location/types'
import ItemStatus from 'components/ItemStatus'
import ItemBadge from 'components/ItemBadge'
import ItemImage from 'components/ItemImage'
import ResetItemButton from './ResetItemButton'
import { Props } from './CollectionItem.types'
import styles from './CollectionItem.module.css'

const LENGTH_LIMIT = 25

export default class CollectionItem extends React.PureComponent<Props> {
  analytics = getAnalytics()

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
    this.analytics.track('Preview Item', {
      ITEM_ID: item?.urn ? (isThirdParty(item.urn) ? extractThirdPartyTokenId(item.urn) : extractTokenId(item.urn)) : null,
      ITEM_TYPE: item.type,
      ITEM_NAME: item.name,
      ITEM_IS_THIRD_PARTY: isThirdParty(item.urn)
    })
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
    ) : !item.price || (isSmart(item) && !(VIDEO_PATH in item.contents)) ? (
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
            <Dropdown.Item text={t('collection_context_menu.see_in_decentraland')} onClick={this.handleSeeInWorld} />
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
        <Table.Cell className={`${styles.avatarColumn}`} width={item.name.length > LENGTH_LIMIT ? 6 : 5}>
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
          {item.rarity && data.category ? <RarityBadge size="medium" rarity={item.rarity} withTooltip /> : null}
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
        <Table.Cell>{this.renderItemStatus()}</Table.Cell>
        <Table.Cell className={styles.contextMenuButton}>{this.renderItemContextMenu()}</Table.Cell>
      </Table.Row>
    )
  }
}
