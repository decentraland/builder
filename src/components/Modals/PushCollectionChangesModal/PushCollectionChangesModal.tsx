import * as React from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Button } from 'decentraland-ui'
import { Props } from './PushCollectionChangesModal.types'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import './PushCollectionChangesModal.css'

const PushCollectionChangesModal = ({ isLoading, onClose, onProceed }: Props) => {
  return (
    <Modal className="PushCollectionChangesModal" size="tiny" onClose={onClose}>
      <Modal.Header>{t('push_collection_changes_modal.title')}</Modal.Header>
      <Modal.Description>
        <T
          id="push_collection_changes_modal.description"
          values={{
            br: (
              <>
                <br />
                <br />
              </>
            )
          }}
        />
      </Modal.Description>
      <Modal.Actions>
        <Button onClick={onClose}>{t('global.cancel')}</Button>
        <Button primary onClick={onProceed} loading={isLoading} disabled={isLoading}>
          {t('global.proceed')}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(PushCollectionChangesModal)
