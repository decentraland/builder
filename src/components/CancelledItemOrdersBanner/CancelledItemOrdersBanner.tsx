import { Link } from 'react-router-dom'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import CancelledItemOrdersAlert from 'components/CancelledItemOrdersAlert'
import { locations } from 'routing/locations'
import { Props } from './CancelledItemOrdersBanner.types'
import styles from './CancelledItemOrdersBanner.module.css'

export const getBannerStorageKey = (address: string) => `builder-cancelled-item-orders-banner-${address.toLowerCase()}`

export default function CancelledItemOrdersBanner({ address, groups, isIncomplete }: Props) {
  const count = groups.reduce((total, group) => total + group.count, 0)

  if (count === 0) {
    return null
  }

  return (
    <CancelledItemOrdersAlert
      storageKey={getBannerStorageKey(address)}
      title={t('cancelled_item_orders.banner.title', { count })}
      text={t('cancelled_item_orders.banner.text')}
      isIncomplete={isIncomplete}
      listId="cancelled-item-orders-collections"
      rows={groups.map(group => (
        <li key={group.contractAddress} className={styles.collection}>
          <span className={styles.name}>{group.collection?.name ?? t('cancelled_item_orders.banner.unknown_collection')}</span>
          <span className={styles.count}>{t('cancelled_item_orders.banner.listings', { count: group.count })}</span>
          {group.collection ? (
            <Link className={styles.link} to={locations.collectionDetail(group.collection.id)}>
              {t('cancelled_item_orders.banner.review')}
            </Link>
          ) : null}
        </li>
      ))}
      showAllLabel={hiddenCount => t('cancelled_item_orders.banner.show_all', { count: hiddenCount })}
      showLessLabel={t('cancelled_item_orders.banner.show_less')}
    />
  )
}
