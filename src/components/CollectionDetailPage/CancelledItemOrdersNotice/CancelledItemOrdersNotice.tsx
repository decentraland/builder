import { useMemo } from 'react'
import { ethers } from 'ethers'
import { Network, TradeAssetType } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Icon, Mana } from 'decentraland-ui'
import { formatCredits, usdWeiToCredits } from 'lib/credits'
import { useDismissedNotice } from 'modules/cancelledTrades/hooks'
import { CancelledItemOrder } from 'modules/cancelledTrades/types'
import { Item } from 'modules/item/types'
import ItemImage from 'components/ItemImage'
import bannerStyles from 'components/CancelledItemOrdersBanner/CancelledItemOrdersBanner.module.css'
import { Props } from './CancelledItemOrdersNotice.types'
import styles from './CancelledItemOrdersNotice.module.css'

export const getNoticeStorageKey = (collectionId: string) => `builder-cancelled-item-orders-notice-${collectionId}`

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

export default function CancelledItemOrdersNotice({ collection, items, orders, onOpenModal }: Props) {
  const [isDismissed, dismiss] = useDismissedNotice(getNoticeStorageKey(collection.id))
  const itemsByTokenId = useMemo(() => new Map(items.filter(item => item.tokenId).map(item => [item.tokenId!, item])), [items])

  if (isDismissed || orders.length === 0) {
    return null
  }

  return (
    <div className={bannerStyles.banner} role="status">
      <i className={bannerStyles.alertIcon} aria-hidden="true" />
      <div className={bannerStyles.message}>
        <h4 className={bannerStyles.title}>{t('cancelled_item_orders.notice.title', { count: orders.length })}</h4>
        <p className={bannerStyles.text}>{t('cancelled_item_orders.notice.text')}</p>
        <ul className={styles.orders}>
          {orders.map(order => {
            const item: Item | undefined = order.asset.itemId ? itemsByTokenId.get(order.asset.itemId) : undefined
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
        </ul>
      </div>
      <button type="button" className={bannerStyles.close} aria-label={t('global.close')} onClick={dismiss}>
        <Icon name="close" />
      </button>
    </div>
  )
}
