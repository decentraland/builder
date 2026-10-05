import { Link } from 'react-router-dom'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Icon } from 'decentraland-ui'
import { useDismissedNotice } from 'modules/cancelledTrades/hooks'
import { locations } from 'routing/locations'
import { Props } from './CancelledItemOrdersBanner.types'
import styles from './CancelledItemOrdersBanner.module.css'

export const getBannerStorageKey = (address: string) => `builder-cancelled-item-orders-banner-${address.toLowerCase()}`

export default function CancelledItemOrdersBanner({ address, groups }: Props) {
  const [isDismissed, dismiss] = useDismissedNotice(getBannerStorageKey(address))
  const count = groups.reduce((total, group) => total + group.count, 0)

  if (isDismissed || count === 0) {
    return null
  }

  return (
    <div className={styles.banner} role="status">
      <i className={styles.alertIcon} aria-hidden="true" />
      <div className={styles.message}>
        <h4 className={styles.title}>{t('cancelled_item_orders.banner.title', { count })}</h4>
        <p className={styles.text}>{t('cancelled_item_orders.banner.text')}</p>
        <ul className={styles.collections}>
          {groups.map(group => (
            <li key={group.contractAddress} className={styles.collection}>
              <span className={styles.collectionName}>
                {group.collection?.name ?? t('cancelled_item_orders.banner.unknown_collection')}
              </span>
              <span className={styles.collectionCount}>{t('cancelled_item_orders.banner.listings', { count: group.count })}</span>
              {group.collection ? (
                <Link className={styles.collectionLink} to={locations.collectionDetail(group.collection.id)}>
                  {t('cancelled_item_orders.banner.review')}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      <button type="button" className={styles.close} aria-label={t('global.close')} onClick={dismiss}>
        <Icon name="close" />
      </button>
    </div>
  )
}
