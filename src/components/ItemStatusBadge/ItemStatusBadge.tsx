import { useMemo } from 'react'
import classNames from 'classnames'
import { Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation'
import { SyncStatus } from 'modules/item/types'
import mapIcon from '../../icons/map.svg'
import underReviewIcon from '../../icons/under_review.svg'
import { isThirdParty } from 'lib/urn'
import { Props } from './ItemStatusBadge.types'
import styles from './ItemStatusBadge.module.css'

export const ItemStatusBadge = (props: Props) => {
  const { status, item } = props
  const isMappingMissingFromItem = !item.mappings && isThirdParty(item.urn)
  const isMappingMissingInCatalysts = !item.isMappingComplete && isThirdParty(item.urn)

  const icon = useMemo(() => {
    if (isMappingMissingFromItem) {
      return <img src={mapIcon} className={styles.icon} />
    } else if (isMappingMissingInCatalysts && status !== SyncStatus.UNDER_REVIEW) {
      return <Icon name="warning circle" />
    }
    switch (status) {
      case SyncStatus.UNDER_REVIEW:
        return <img src={underReviewIcon} className={styles.icon} />
      case SyncStatus.SYNCED:
        return <Icon name="check circle" />
      case SyncStatus.UNSYNCED:
      case SyncStatus.UNPUBLISHED:
        return <Icon name="cloud upload" />
    }
  }, [status])

  const text = useMemo(() => {
    if (isMappingMissingFromItem) {
      return t('item_status.pending_mapping')
    } else if (isMappingMissingInCatalysts && status !== SyncStatus.UNDER_REVIEW) {
      return t('item_status.pending_migration')
    }
    return t(`item_status.${status}`)
  }, [status])

  const style = useMemo(() => {
    if (!item.mappings) {
      return 'pending_mapping'
    } else if (isMappingMissingInCatalysts && status !== SyncStatus.UNDER_REVIEW) {
      return 'pending_migration'
    }
    return status
  }, [status])

  return (
    <div className={classNames(styles[style], styles.status)}>
      {icon} {text}
    </div>
  )
}
