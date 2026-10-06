import { useMemo } from 'react'
import { ethers } from 'ethers'
import { Network, TradeAssetType } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Mana } from 'decentraland-ui'
import { formatCredits, usdWeiToCredits } from 'lib/credits'
import { CancelledItemOrder } from 'modules/cancelledItemOrders/types'
import ItemImage from 'components/ItemImage'
import CancelledItemOrdersAlert from 'components/CancelledItemOrdersAlert'
import { Props } from './CancelledItemOrdersNotice.types'
import styles from './CancelledItemOrdersNotice.module.css'

export const getNoticeStorageKey = (address: string, collectionId: string) =>
  `builder-cancelled-item-orders-notice-${address.toLowerCase()}-${collectionId}`

function renderPrice(price: CancelledItemOrder['price']) {
  if (!price) {
    return null
  }
  if (price.assetType === TradeAssetType.USD_PEGGED_MANA) {
    const credits = usdWeiToCredits(price.amount)
    return credits === null ? null : (
      <span className={styles.credits}>{t('cancelled_item_orders.notice.credits', { amount: formatCredits(credits) })}</span>
    )
  }
  return (
    <Mana className={styles.mana} network={Network.MATIC} size="small" inline>
      {ethers.utils.formatEther(price.amount)}
    </Mana>
  )
}

export default function CancelledItemOrdersNotice({ address, collection, items, orders, isIncomplete, onOpenModal }: Props) {
  const itemsByTokenId = useMemo(() => new Map(items.filter(item => item.tokenId).map(item => [item.tokenId!, item])), [items])
  // Re-listable orders first
  const rows = useMemo(() => {
    const withItem = orders.map(order => ({ order, item: order.asset.itemId ? itemsByTokenId.get(order.asset.itemId) : undefined }))
    return [...withItem.filter(row => row.item), ...withItem.filter(row => !row.item)]
  }, [orders, itemsByTokenId])

  if (orders.length === 0) {
    return null
  }

  return (
    <CancelledItemOrdersAlert
      storageKey={getNoticeStorageKey(address, collection.id)}
      title={t('cancelled_item_orders.notice.title', { count: orders.length })}
      text={t('cancelled_item_orders.notice.text')}
      isIncomplete={isIncomplete}
      listId="cancelled-item-orders-listings"
      rows={rows.map(({ order, item }) => {
        const name = item?.name ?? order.asset.name ?? t('cancelled_item_orders.notice.unknown_item')
        const price = renderPrice(order.price)
        return (
          <li key={order.id} className={styles.order}>
            {item ? (
              <ItemImage className={styles.image} item={item} />
            ) : (
              <div className={styles.image}>{order.asset.image ? <img src={order.asset.image} alt={name} /> : null}</div>
            )}
            <div className={styles.details}>
              <span className={styles.name} title={name}>
                {name}
              </span>
              {price ? (
                <span className={styles.price}>
                  {t('cancelled_item_orders.notice.previous_price')} {price}
                </span>
              ) : null}
            </div>
            {item ? (
              <Button
                primary
                size="small"
                className={styles.action}
                onClick={() => onOpenModal('PutForSaleOffchainModal', { itemId: item.id })}
              >
                {t('cancelled_item_orders.notice.put_for_sale_again')}
              </Button>
            ) : null}
          </li>
        )
      })}
      showAllLabel={hiddenCount => t('cancelled_item_orders.notice.show_all', { count: hiddenCount })}
      showLessLabel={t('cancelled_item_orders.notice.show_less')}
    />
  )
}
