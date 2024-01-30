import { useCallback, useEffect, useMemo } from 'react'
import { Button, Close, Icon, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props } from './ReclaimNameModal.types'
import styles from './ReclaimNameModal.module.css'

export default function ReclaimNameModal(props: Props) {
  const { error, ens, isLoadingReclaim, isWaitingTxReclaim, onUnmount, onClose, onReclaim } = props
  const handleReclaimName = useCallback(() => {
    onReclaim(ens)
  }, [ens, onReclaim])

  useEffect(() => {
    return () => {
      onUnmount()
    }
  }, [onUnmount])

  const statusMessage = useMemo(() => {
    if (isLoadingReclaim) {
      return (
        <span className={styles.status}>
          <Loader inline active size="tiny" />
          {t('ens_reclaim_name_modal.confirm_transaction')}
        </span>
      )
    } else if (isWaitingTxReclaim) {
      return (
        <span className={styles.status}>
          <Loader inline active size="tiny" />
          {t('ens_reclaim_name_modal.processing')}
        </span>
      )
    } else if (error) {
      return (
        <span className={styles.status}>
          <Icon name="close" className={styles.icon} />
          {t('ens_reclaim_name_modal.error')}
        </span>
      )
    }
    return null
  }, [isLoadingReclaim, isWaitingTxReclaim, error])

  const disableActions = isLoadingReclaim || isWaitingTxReclaim

  return (
    <Modal closeIcon={disableActions ? undefined : <Close />} onClose={disableActions ? undefined : onClose} size="tiny">
      <div className={styles.main}>
        <h1>{t('ens_reclaim_name_modal.title')}</h1>
        <span className={styles.info}>{t('ens_reclaim_name_modal.info', { br: () => <br /> })}</span>
        <div className={styles.actions}>
          <Button primary onClick={handleReclaimName} disabled={disableActions}>
            {t('ens_reclaim_name_modal.action')}
          </Button>
          {statusMessage}
        </div>
      </div>
    </Modal>
  )
}
