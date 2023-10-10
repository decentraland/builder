import React, { useCallback } from 'react'
import { Button, ModalActions, ModalContent, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props } from './WorldsForENSOwnersAnnouncementModal.types'
import { persistCanOpenWorldsForENSOwnersAnnouncementModal } from './utils'
import ensImg from './images/ens.svg'
import styles from './WorldsForENSOwnersAnnouncementModal.module.css'

export const DOCUMENTATION_URL = 'https://docs.decentraland.org/creator/worlds/about/'

const WorldsForENSOwnersAnnouncementModal: React.FC<Props> = ({ name, onClose }) => {
  const handleOnClose = useCallback(() => {
    persistCanOpenWorldsForENSOwnersAnnouncementModal(false)
    onClose()
  }, [onClose])

  return (
    <Modal name={name} onClose={handleOnClose}>
      <ModalNavigation
        title={<div className={styles.title}>{t('worlds_for_ens_owners_announcement_modal.title')}</div>}
        onClose={handleOnClose}
      />
      <ModalContent>
        <div className={styles.img}>
          <img src={ensImg} alt="ens" />
        </div>
        <div className={styles.description}>
          <div className={styles.bold}>{t('worlds_for_ens_owners_announcement_modal.description_ens')}</div>
          <div>
            {t('worlds_for_ens_owners_announcement_modal.description_dcl', {
              b: (text: string) => <span className={styles.bold}>{text}</span>
            })}
          </div>
        </div>
      </ModalContent>
      <ModalActions className={styles.actions}>
        <Button primary onClick={handleOnClose}>
          {t('worlds_for_ens_owners_announcement_modal.start_building')}
        </Button>
        <Button as="a" href={DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
          {t('worlds_for_ens_owners_announcement_modal.learn_more')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default React.memo(WorldsForENSOwnersAnnouncementModal)
