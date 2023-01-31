import React, { useCallback } from 'react'
import { ModalNavigation, ModalActions, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props } from './DeleteItemModal.types'
import './DeleteItemModal.css'

export const DeleteItemModal: React.FC<Props> = props => {
  const { name, metadata, isLoading, onClose, onDeleteItem } = props
  const { item } = metadata

  const handleConfirm = useCallback(() => {
    onDeleteItem(item)
  }, [item, onDeleteItem])

  return (
    <Modal name={name} onClose={onClose} size="tiny" closeOnDimmerClick={false}>
      <ModalNavigation
        title={t('delete_item_modal.title', { name: item.name })}
        subtitle={t('delete_item_modal.subtitle', { name: item.name, br: <br /> })}
        onClose={onClose}
      />
      <ModalActions>
        <Button primary onClick={handleConfirm} loading={isLoading} disabled={isLoading || !item}>
          {t('global.confirm')}
        </Button>
        <Button secondary onClick={() => onClose()} loading={isLoading} disabled={isLoading}>
          {t('global.cancel')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default DeleteItemModal
