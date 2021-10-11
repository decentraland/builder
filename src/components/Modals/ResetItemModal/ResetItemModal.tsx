import React from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Button, ModalNavigation } from 'decentraland-ui'
import { Props } from './ResetItemModal.types'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'

const ResetItemModal = ({ onClose, onConfirm }: Props) => {
  return (
    <Modal className="ResetItemModal" size="tiny" onClose={onClose}>
      <ModalNavigation title={t('reset_item_modal.title')} onClose={onClose} />
      <Modal.Content>
        <T
          id="reset_item_modal.content"
          values={{
            br: (
              <>
                <br />
                <br />
              </>
            )
          }}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button secondary onClick={onClose}>
          {t('global.cancel')}
        </Button>
        <Button primary onClick={onConfirm}>
          {t('global.confirm')}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(ResetItemModal)
