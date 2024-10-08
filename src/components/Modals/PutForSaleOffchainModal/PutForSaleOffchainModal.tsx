import { Props } from './PutForSaleOffchainModal.types'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import EditPriceAndBeneficiaryModal from '../EditPriceAndBeneficiaryModal/EditPriceAndBeneficiaryModal'
import { Item } from 'modules/item/types'
import { Button, Icon, Loader, ModalActions, ModalContent } from 'decentraland-ui'
import styles from './PutForSaleOffchainModal.module.css'
import { t } from 'decentraland-dapps/dist/modules/translation'

export default function PutForSaleOffchainModal({
  item,
  collection,
  error,
  metadata,
  isLoading,
  isLoadingCancel,
  onClose,
  onCreateItemOrder,
  onRemoveFromSale
}: Props) {
  const handlePutForSale = (_itemId: string, price: string, beneficiary: string, expiresAt = new Date()) => {
    if (!collection || !item) {
      console.error('Collection or item not found')
      return
    }
    onCreateItemOrder(item as Item, price, beneficiary, collection, expiresAt)
  }

  const handleRemoveFromSale = () => {
    onRemoveFromSale(item.tradeId!)
  }

  if (item.tradeId) {
    return (
      <Modal name="PutForSaleOffchainModal" onClose={onClose} size="small">
        <ModalContent>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              {isLoadingCancel ? <Loader active size="large" inline /> : <Icon name="tag" size="big" />}
            </div>
            <h2 className={styles.modalTitle}>{t('put_for_sale_offchain_modal.title')}</h2>
            <p className={styles.modalSubtitle}>{t('put_for_sale_offchain_modal.subtitle')}</p>
          </div>
          {error ? <span className={styles.error}>{error}</span> : null}
        </ModalContent>
        <ModalActions>
          <Button onClick={onClose} disabled={isLoadingCancel}>
            {t('put_for_sale_offchain_modal.cancel')}
          </Button>
          <Button primary onClick={handleRemoveFromSale} disabled={isLoadingCancel} loading={isLoadingCancel}>
            {t('put_for_sale_offchain_modal.reject_old_prices')}
          </Button>
        </ModalActions>
      </Modal>
    )
  }

  return (
    <EditPriceAndBeneficiaryModal
      name="EditPriceAndBeneficiaryModal"
      metadata={metadata}
      isLoading={isLoading}
      onSetPriceAndBeneficiary={handlePutForSale}
      error={error}
      item={item}
      onClose={onClose}
      onSave={() => undefined}
      withExpirationDate
    />
  )
}
