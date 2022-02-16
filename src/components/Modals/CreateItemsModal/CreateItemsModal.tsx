import * as React from 'react'
import { ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props } from './CreateItemsModal.types'
import styles from './CreateItemsModal.module.css'

export default class CreateItemsModal extends React.PureComponent<Props> {
  private handleOpenSingleItemModal = () => {
    this.handleOpenModal('CreateSingleItemModal')
  }

  private handleOpenMultipleItemsModal = () => {
    this.handleOpenModal('CreateMultipleItemsModal')
  }

  private handleOpenModal = (name: string) => {
    const { onClose, onOpenModal, metadata } = this.props
    onOpenModal(name, metadata)
    onClose()
  }

  public render() {
    const { name, onClose } = this.props

    return (
      <Modal size="tiny" name={name} onClose={onClose}>
        <ModalNavigation title={t('create_items_modal.title')} onClose={onClose} />
        <Modal.Content>
          <p className={styles.modalSubtitle}>{t('create_items_modal.subtitle')}</p>

          <div className={styles.modalButtons}>
            <div className={styles.itemSelectionButton} onClick={this.handleOpenSingleItemModal} role="button">
              <div className={styles.icon}>
                <div className={styles.sparkle}></div>
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{t('create_items_modal.single_item_button_name')}</div>
                <div className={styles.description}>{t('create_items_modal.single_item_button_description')}</div>
              </div>
            </div>

            <div className={styles.itemSelectionButton} onClick={this.handleOpenMultipleItemsModal} role="button">
              <div className={styles.icon}>
                <div className={styles.sparkles}></div>
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{t('create_items_modal.multiple_items_button_name')}</div>
                <div className={styles.description}>{t('create_items_modal.multiple_items_button_description')}</div>
              </div>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}
