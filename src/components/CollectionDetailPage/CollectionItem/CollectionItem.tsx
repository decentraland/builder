import { useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import { EmoteDataADR74, Network } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { RarityBadge } from 'decentraland-dapps/dist/containers/RarityBadge'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { Dropdown, Icon, Button, Mana, Popup, Table } from 'decentraland-ui'
import { Link, useHistory } from 'react-router-dom'
import { locations } from 'routing/locations'
import { preventDefault } from 'lib/event'
import { formatCredits, formatCreditsFull, usdWeiToCredits } from 'lib/credits'
import { extractThirdPartyTokenId, extractTokenId, isThirdParty } from 'lib/urn'
import { isComplete, canManageItem, getMaxSupply, isItemSoldOut, isSmart, isEmote, isFree } from 'modules/item/utils'
import { isEnableForSaleOffchain, isLocked, isOnSale } from 'modules/collection/utils'
import { isEmoteData, SyncStatus, VIDEO_PATH, WearableData } from 'modules/item/types'
import { FromParam } from 'modules/location/types'
import { PriceDenomination } from 'modules/trade/denomination'
import { useTradePriceDenomination } from 'modules/trade/hooks'
import ItemStatus from 'components/ItemStatus'
import ItemBadge from 'components/ItemBadge'
import ItemImage from 'components/ItemImage'
import ResetItemButton from './ResetItemButton'
import { shopItemUrl } from 'lib/shop'
import { Props } from './CollectionItem.types'
import styles from './CollectionItem.module.css'

const LENGTH_LIMIT = 25

export default function CollectionItem({
  onOpenModal,
  onSetItems,
  onRemoveFromSale,
  item,
  isOffchainPublicItemOrdersEnabled,
  isOffchainPublicItemOrdersEnabledVariants,
  collection,
  status,
  ethAddress,
  wallet,
  loadingTradeIds,
  isCancellingItemOrder
}: Props) {
  const analytics = getAnalytics()
  const history = useHistory()
  // `fetchCollectionItemsRequest` overwrites `item.price` with the marketplace's published price, which
  // is USD wei — not MANA wei — when the item was listed through the shop. See modules/trade/denomination.
  const isUSDPeggedPrice = useTradePriceDenomination(item.tradeId) === PriceDenomination.USD_PEGGED
  const isOnSaleLegacy = wallet && isOnSale(collection, wallet)
  const isEnableForSaleOffchainMarketplace = wallet && isOffchainPublicItemOrdersEnabled && isEnableForSaleOffchain(collection, wallet)
  const isSoldOut = isItemSoldOut(item)
  const shouldAllowPriceEdition =
    !isOffchainPublicItemOrdersEnabled || (isEnableForSaleOffchainMarketplace && item.tradeId) || isOnSaleLegacy

  /**
   * Where this item is bought, when it is bought with credits. Empty when the listing is MANA (the marketplace
   * already covers that) or when SHOP_WEB_URL is unset, so a missing config hides the link instead of pointing
   * a creator at nowhere.
   */
  const shopListingUrl = useMemo(
    // `tokenId` is the item's blockchain id in this app's vocabulary — the same value the published-item merge
    // keys on (`${contractAddress}-${item.tokenId}`) and the trade builder sends as `itemId`.
    () => (isUSDPeggedPrice && item.tokenId ? shopItemUrl(collection.contractAddress!, item.tokenId) : ''),
    [isUSDPeggedPrice, item.tokenId, collection.contractAddress]
  )

  const isWalletVariant = useMemo(() => {
    return isOffchainPublicItemOrdersEnabledVariants?.payload?.value?.trim()?.toLocaleLowerCase() === ethAddress?.toLocaleLowerCase()
  }, [isOffchainPublicItemOrdersEnabledVariants, ethAddress])

  const handleEditPriceAndBeneficiary = useCallback(() => {
    if (isOffchainPublicItemOrdersEnabled && isEnableForSaleOffchainMarketplace && !isWalletVariant) {
      onOpenModal('PutForSaleOffchainModal', { itemId: item.id })
      return
    }

    onOpenModal('EditPriceAndBeneficiaryModal', { itemId: item.id })
  }, [item, onOpenModal])

  const handleSeeInWorld = useCallback(() => {
    onOpenModal('SeeInWorldModal', { itemIds: [item.id] })
  }, [onOpenModal, item])

  const handleNavigateToEditor = useCallback(() => {
    onSetItems([item])
    history.push(locations.itemEditor({ itemId: item.id, collectionId: item.collectionId }), { fromParam: FromParam.COLLECTIONS })
    analytics?.track('Preview Item', {
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

  const handleCopyURN = useCallback(() => {
    if (item.urn) {
      navigator.clipboard.writeText(item.urn)
    }
  }, [item.urn])

  const handlePutForSale = useCallback(() => {
    onOpenModal('PutForSaleOffchainModal', { itemId: item.id })
  }, [])

  const handleRemoveFromSale = useCallback(() => {
    if (!item.tradeId) {
      return
    }
    onRemoveFromSale(item.tradeId)
  }, [item])

  const renderPrice = useCallback(() => {
    if (!item.price || isWalletVariant) {
      return (
        <div className={`link ${styles.linkAction}`} onClick={preventDefault(handleEditPriceAndBeneficiary)}>
          {t('collection_item.set_price')}
        </div>
      )
    }

    if (item.price === ethers.constants.MaxUint256.toString() || (isOffchainPublicItemOrdersEnabled && !isOnSaleLegacy && !item.tradeId)) {
      return <span>-</span>
    }

    if (isFree(item)) {
      return <span>{t('global.free')}</span>
    }

    if (isUSDPeggedPrice) {
      const credits = usdWeiToCredits(item.price)
      return credits === null ? (
        <span>-</span>
      ) : (
        <span className={styles.credits} title={t('collection_item.credits_amount', { amount: formatCreditsFull(credits) })}>
          <i className={styles.creditsIcon} aria-hidden="true" />
          {formatCredits(credits)}
        </span>
      )
    }

    return (
      <Mana className={styles.mana} network={Network.MATIC} showTooltip>
        {ethers.utils.formatEther(item.price)}
      </Mana>
    )
  }, [item, isOnSaleLegacy, isOffchainPublicItemOrdersEnabled, isUSDPeggedPrice, handleEditPriceAndBeneficiary])

  const renderItemStatus = useCallback(() => {
    return status === SyncStatus.UNSYNCED ? (
      <div className={`${styles.unsynced} ${styles.status}`}>
        <div className={styles.alertIcon} />
        {t('collection_item.unsynced')}
      </div>
    ) : status === SyncStatus.UNDER_REVIEW || (item.isPublished && !item.isApproved) ? (
      <div className={`${styles.underReview} ${styles.status}`}>
        <Icon name="clock outline" />
        {t('collection_item.under_review')}
      </div>
    ) : item.isPublished && item.isApproved && shopListingUrl ? (
      /*
       * A credits listing lives in the SHOP, a different site from the marketplace this app publishes to —
       * and until now nothing here could say so, which left a creator with a price they could not place. More
       * specific than the plain "Published" it replaces: a pegged listing implies the item is published, and
       * says where it is actually being sold.
       */
      <a
        className={`${styles.published} ${styles.status} ${styles.shopLink}`}
        href={shopListingUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={event => event.stopPropagation()}
      >
        <Icon name="check circle outline" />
        {t('collection_item.on_sale_in_shop')}
      </a>
    ) : item.isPublished && item.isApproved ? (
      <div className={`${styles.published} ${styles.status}`}>
        <Icon name="check circle outline" />
        {t('collection_item.published')}
      </div>
    ) : isComplete(item) ? (
      <div className={`${styles.ready} ${styles.status}`}>
        <Icon className={styles.check} name="cloud upload" />
        {t('collection_item.ready')}
      </div>
    ) : !item.price || (isSmart(item) && !(VIDEO_PATH in item.contents)) ? (
      <div className={`${styles.notReady} ${styles.status}`}>
        <Icon name="exclamation circle" />
        {t('collection_item.not_ready')}
      </div>
    ) : (
      <span onClick={preventDefault(handleNavigateToEditor)} className={`link ${styles.linkAction}`}>
        {t('collection_item.edit_item')}
      </span>
    )
  }, [handleNavigateToEditor, item, status, shopListingUrl])

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
            {item.urn && <Dropdown.Item text={t('collection_item.copy_urn')} onClick={handleCopyURN} />}
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
    handleCopyURN,
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
      {isOffchainPublicItemOrdersEnabled && !collection.isPublished ? null : (
        <Table.Cell className={styles.column}>{renderPrice()}</Table.Cell>
      )}
      {item.isPublished && item.isApproved ? (
        <Table.Cell className={styles.column}>
          <div>
            {item.totalSupply}/{getMaxSupply(item)}
          </div>
        </Table.Cell>
      ) : null}
      <Table.Cell>{renderItemStatus()}</Table.Cell>
      {isOffchainPublicItemOrdersEnabled && !isOnSaleLegacy && !item.tradeId && item.isPublished && (
        <Table.Cell>
          <Popup
            content={t('collection_item.sold_out')}
            position="top center"
            disabled={!isSoldOut}
            trigger={
              <span>
                <Button primary size="tiny" disabled={!isEnableForSaleOffchainMarketplace || isSoldOut} onClick={handlePutForSale}>
                  {t('collection_item.put_for_sale')}
                </Button>
              </span>
            }
          />
        </Table.Cell>
      )}
      {isOffchainPublicItemOrdersEnabled && item.tradeId && (
        <Table.Cell>
          <Button
            secondary
            size="tiny"
            className={styles.removeSaleButton}
            onClick={handleRemoveFromSale}
            loading={isCancellingItemOrder && loadingTradeIds.includes(item.tradeId)}
          >
            {t('collection_item.remove_from_sale')}
          </Button>
        </Table.Cell>
      )}
      <Table.Cell className={styles.contextMenuButton}>{renderItemContextMenu()}</Table.Cell>
    </Table.Row>
  )
}
