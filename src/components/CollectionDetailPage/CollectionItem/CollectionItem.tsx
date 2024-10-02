import { useCallback } from 'react'
import { ethers } from 'ethers'
import { EmoteDataADR74, Network } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { RarityBadge } from 'decentraland-dapps/dist/containers/RarityBadge'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { Dropdown, Icon, Button, Mana, Table } from 'decentraland-ui'
import { Link, useHistory } from 'react-router-dom'
import { locations } from 'routing/locations'
import { preventDefault } from 'lib/event'
import { extractThirdPartyTokenId, extractTokenId, isThirdParty } from 'lib/urn'
import { isComplete, canManageItem, getMaxSupply, isSmart, isEmote, isFree } from 'modules/item/utils'
import { isEnableForSaleOffchain, isLocked, isOnSale } from 'modules/collection/utils'
import { isEmoteData, SyncStatus, VIDEO_PATH, WearableData } from 'modules/item/types'
import { FromParam } from 'modules/location/types'
import ItemStatus from 'components/ItemStatus'
import ItemBadge from 'components/ItemBadge'
import ItemImage from 'components/ItemImage'
import ResetItemButton from './ResetItemButton'
import { Props } from './CollectionItem.types'
import styles from './CollectionItem.module.css'

const LENGTH_LIMIT = 25

export default function CollectionItem({
  onOpenModal,
  onSetItems,
  item,
  isOffchainPublicItemOrdersEnabled,
  collection,
  status,
  ethAddress,
  wallet
}: Props) {
  analytics = getAnalytics()
  const history = useHistory()
  const isOnSaleLegacy = wallet && isOnSale(collection, wallet)
  const isEnableForSaleOffchainMarketplace = wallet && isOffchainPublicItemOrdersEnabled && isEnableForSaleOffchain(collection, wallet)
  const shouldAllowPriceEdition = !isOffchainPublicItemOrdersEnabled || isEnableForSaleOffchainMarketplace || isOnSaleLegacy

  const handleEditPriceAndBeneficiary = useCallback(() => {
    onOpenModal('EditPriceAndBeneficiaryModal', { itemId: item.id })
  }, [item, onOpenModal])

  const handleSeeInWorld = useCallback(() => {
    onOpenModal('SeeInWorldModal', { itemIds: [item.id] })
  }, [onOpenModal, item])

  const handleNavigateToEditor = useCallback(() => {
    onSetItems([item])
    history.push(locations.itemEditor({ itemId: item.id, collectionId: item.collectionId }), { fromParam: FromParam.COLLECTIONS })
    analytics.track('Preview Item', {
      ITEM_ID: item?.urn ? (isThirdParty(item.urn) ? extractThirdPartyTokenId(item.urn) : extractTokenId(item.urn)) : null,
      ITEM_TYPE: item.type,
      ITEM_NAME: item.name,
      ITEM_IS_THIRD_PARTY: isThirdParty(item.urn)
    })
  }, [item, onSetItems, history])

  const handleDeleteItem = useCallback(() => {
    onOpenModal('DeleteItemModal', { item })
  }, [item, onOpenModal])

  const handleMoveToAnotherCollection = useCallback(() => {
    onOpenModal('MoveItemToAnotherCollectionModal', { item, fromCollection: collection })
  }, [item, onOpenModal, collection])

  const handlePutForSale = useCallback(() => {
    onOpenModal('PutForSaleOffchainModal', { itemId: item.id })
  }, [])

  const renderPrice = useCallback(() => {
    if (!item.price) {
      return (
        <div className={`link ${styles.linkAction}`} onClick={preventDefault(handleEditPriceAndBeneficiary)}>
          {t('collection_item.set_price')}
        </div>
      )
    }

    if (isFree(item)) {
      return <span>{t('global.free')}</span>
    }

    if (item.price === ethers.constants.MaxUint256.toString()) {
      return <span>-</span>
    }

    return (
      <Mana className={styles.mana} network={Network.MATIC} showTooltip>
        {ethers.utils.formatEther(item.price)}
      </Mana>
    )
  }, [item, handleEditPriceAndBeneficiary])

  const renderItemStatus = useCallback(() => {
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
      <span onClick={preventDefault(handleNavigateToEditor)} className={`link ${styles.linkAction}`}>
        {t('collection_item.edit_item')}
      </span>
    )
  }, [handleNavigateToEditor, item, status])

  const renderItemContextMenu = useCallback(() => {
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
            <Dropdown.Item text={t('collection_context_menu.see_in_decentraland')} onClick={handleSeeInWorld} />
            <Dropdown.Item text={t('collection_item.preview')} onClick={handleNavigateToEditor} />
            {!collection.isPublished && (
              <Dropdown.Item text={t('collection_item.move_to_another_collection')} onClick={handleMoveToAnotherCollection} />
            )}
            {canManageItem(collection, item, ethAddress) && !isLocked(collection) ? (
              <>
                {item.price && shouldAllowPriceEdition ? (
                  <Dropdown.Item text={t('collection_item.edit_price')} onClick={handleEditPriceAndBeneficiary} />
                ) : null}
                <ResetItemButton itemId={item.id} />
                {!item.isPublished ? (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item text={t('collection_item.delete_item')} onClick={handleDeleteItem} />
                  </>
                ) : null}
              </>
            ) : null}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }, [
    collection,
    item,
    ethAddress,
    handleSeeInWorld,
    handleNavigateToEditor,
    handleMoveToAnotherCollection,
    handleEditPriceAndBeneficiary,
    handleDeleteItem
  ])

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
      {isEmote(item) && isEmoteData(data) ? (
        <Table.Cell className={styles.column}>
          {data.category ? <div>{t(`emote.play_mode.${data.loop ? 'loop' : 'simple'}.text`)}</div> : null}
        </Table.Cell>
      ) : null}
      <Table.Cell className={styles.column}>{renderPrice()}</Table.Cell>
      {item.isPublished && item.isApproved ? (
        <Table.Cell className={styles.column}>
          <div>
            {item.totalSupply}/{getMaxSupply(item)}
          </div>
        </Table.Cell>
      ) : null}
      <Table.Cell>{renderItemStatus()}</Table.Cell>
      {isOffchainPublicItemOrdersEnabled && !isOnSaleLegacy && (
        <Table.Cell>
          <Button primary size="tiny" disabled={!isEnableForSaleOffchainMarketplace} onClick={handlePutForSale}>
            {t('collection_item.put_for_sale')}
          </Button>
        </Table.Cell>
      )}
      <Table.Cell className={styles.contextMenuButton}>{renderItemContextMenu()}</Table.Cell>
    </Table.Row>
  )
}
