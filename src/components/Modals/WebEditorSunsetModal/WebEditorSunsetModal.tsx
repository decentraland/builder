import React, { useCallback } from 'react'
import { Button, Modal, ModalActions, ModalContent, ModalNavigation } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import styles from './WebEditorSunsetModal.module.css'

const CREATOR_HUB_DOWNLOAD_URL = config.get('CREATOR_HUB_DOWNLOAD_URL')

type Props = {
  onContinue: () => void
  onClose: () => void
}

const WebEditorSunsetModal: React.FC<Props> = ({ onContinue, onClose }) => {
  const handleDownload = useCallback(() => {
    window.open(CREATOR_HUB_DOWNLOAD_URL, '_blank', 'noopener,noreferrer')
    onClose()
  }, [onClose])

  return (
    <Modal open className={styles.modal} onClose={onClose}>
      <ModalNavigation title={t('web_editor_sunset_modal.title')} onClose={onClose} />
      <ModalContent className={styles.content}>
        <p className={styles.description}>
          {t('web_editor_sunset_modal.description', {
            a: (text: string) => (
              <a href={CREATOR_HUB_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                {text}
              </a>
            )
          })}
        </p>
      </ModalContent>
      <ModalActions className={styles.actions}>
        <Button primary onClick={handleDownload}>
          {t('web_editor_sunset_modal.download_creator_hub')}
        </Button>
        <Button secondary onClick={onContinue}>
          {t('web_editor_sunset_modal.continue_to_editor')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default React.memo(WebEditorSunsetModal)
