import React, { useCallback } from 'react'
import { Button, ModalActions, ModalContent } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props } from './CreatorHubUpgradeModal.types'
import dclLogo from 'images/dcl.svg'
import codeImg from 'images/creator-hub-step1.png'
import publishImg from 'images/creator-hub-step2.png'
import styles from './CreatorHubUpgradeModal.module.css'

const CREATOR_HUB_DOWNLOAD_URL = 'https://decentraland.org/download/creator-hub/'

const CreatorHubUpgradeModal: React.FC<Props> = ({ name, onClose }) => {
  const handleSkip = useCallback(() => {
    onClose()
  }, [onClose])

  const handleDownload = useCallback(() => {
    window.open(CREATOR_HUB_DOWNLOAD_URL, '_blank', 'noopener,noreferrer')
    onClose()
  }, [onClose])

  return (
    <Modal name={name} onClose={handleSkip} size="tiny">
      <ModalContent>
        <div className={styles.header}>
          <img src={dclLogo} alt="Decentraland" className={styles.logo} />
          <h2 className={styles.title}>{t('creator_hub_upgrade_modal.title')}</h2>
        </div>

        <p className={styles.description}>{t('creator_hub_upgrade_modal.description')}</p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <img src={codeImg} alt="Code editor" className={styles.featureImage} />
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>{t('creator_hub_upgrade_modal.feature1.title')}</h3>
              <p className={styles.featureDescription}>{t('creator_hub_upgrade_modal.feature1.description')}</p>
            </div>
          </div>
          <div className={styles.feature}>
            <img src={publishImg} alt="Publish" className={styles.featureImage} />
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>{t('creator_hub_upgrade_modal.feature2.title')}</h3>
              <p className={styles.featureDescription}>{t('creator_hub_upgrade_modal.feature2.description')}</p>
            </div>
          </div>
        </div>
      </ModalContent>

      <ModalActions className={styles.actions}>
        <Button primary onClick={handleDownload}>
          {t('creator_hub_upgrade_modal.download')}
        </Button>
        <Button secondary onClick={handleSkip}>
          {t('creator_hub_upgrade_modal.skip_for_now')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default React.memo(CreatorHubUpgradeModal)
