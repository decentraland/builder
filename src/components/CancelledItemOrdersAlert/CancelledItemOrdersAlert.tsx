import { useState } from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Notice from 'components/Notice'
import { Props } from './CancelledItemOrdersAlert.types'
import styles from './CancelledItemOrdersAlert.module.css'

export const MAX_VISIBLE_ROWS = 5
export const CANCELLED_ITEM_ORDERS_POST_MORTEM_URL =
  'https://forum.decentraland.org/t/october-2026-off-chain-marketplace-cancelled-order-replay-eip-7702-signature-malleability-post-mortem/25452'

export default function CancelledItemOrdersAlert({
  storageKey,
  title,
  text,
  isIncomplete,
  incompleteText,
  listId,
  rows,
  showAllLabel,
  showLessLabel
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hiddenCount = Math.max(rows.length - MAX_VISIBLE_ROWS, 0)

  return (
    <Notice storageKey={storageKey} className={styles.alert}>
      <div className={styles.content} role="status">
        <i className={styles.alertIcon} aria-hidden="true" />
        <div className={styles.message}>
          <h4 className={styles.title}>{title}</h4>
          <p className={styles.description}>
            {text}{' '}
            <a className={styles.learnMore} href={CANCELLED_ITEM_ORDERS_POST_MORTEM_URL} target="_blank" rel="noopener noreferrer">
              {t('cancelled_item_orders.learn_more')}
            </a>
          </p>
          {isIncomplete ? <p className={styles.warning}>{incompleteText}</p> : null}
          <ul id={listId} className={isExpanded ? `${styles.list} ${styles.scrollable}` : styles.list}>
            {isExpanded ? rows : rows.slice(0, MAX_VISIBLE_ROWS)}
          </ul>
          {hiddenCount > 0 ? (
            <button
              type="button"
              className={styles.toggle}
              aria-expanded={isExpanded}
              aria-controls={listId}
              onClick={() => setIsExpanded(expanded => !expanded)}
            >
              {isExpanded ? showLessLabel : showAllLabel(hiddenCount)}
            </button>
          ) : null}
        </div>
      </div>
    </Notice>
  )
}
