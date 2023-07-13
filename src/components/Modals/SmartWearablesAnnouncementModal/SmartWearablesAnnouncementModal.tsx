import React from 'react'
import { Button, Close } from 'decentraland-ui'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { LOCALSTORAGE_SMART_WEARABLES_ANNOUCEMENT } from 'components/CollectionsPage/CollectionsPage'
import styles from './SmartWearablesAnnouncementModal.module.css'

// const PUBLIC_URL = process.env.PUBLIC_URL
const localStorage = getLocalStorage()
// const videoSrc = '/videos/template-preview.mp4'

const SmartWearablesAnnouncementModal: React.FC<ModalProps> = ({ name, onClose }) => {
  const handleClose = () => {
    localStorage.setItem(LOCALSTORAGE_SMART_WEARABLES_ANNOUCEMENT, '1')
    onClose()
  }

  const handleLearnMore = () => {
    handleClose()
    window.open('https://docs.decentraland.org/creator/development-guide/smart-wearables/', '_blank', 'noopener noreferrer')
  }

  return (
    <Modal className={styles.modal} name={name} onClose={handleClose} closeIcon={<Close onClick={handleClose} />}>
      <Modal.Content className={styles.content}>
        <h1 className={styles.title}>{t('smart_wearables_announcement_modal.title')}</h1>
        <span className={styles.description}>{t('smart_wearables_announcement_modal.description')}</span>
        {/* TODO: add the video here */}
        {/* <video autoPlay loop className={styles.thumbnail} src={`${PUBLIC_URL}${videoSrc}`} muted /> */}
      </Modal.Content>
      <Modal.Actions className={styles.actions}>
        <Button primary onClick={handleLearnMore}>
          {t('smart_wearables_announcement_modal.learn_more')}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(SmartWearablesAnnouncementModal)
