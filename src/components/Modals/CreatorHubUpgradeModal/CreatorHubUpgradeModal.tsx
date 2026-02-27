import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Button, ModalActions, ModalContent } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, CreatorHubUpgradeModalMetadata } from './CreatorHubUpgradeModal.types'
import coverImg from 'images/creator-hub-cover.png'
import codeImg from 'images/creator-hub-step1.png'
import publishImg from 'images/creator-hub-step2.png'
import accessImg from 'images/creator-hub-step3.png'
import collaborationImg from 'images/creator-hub-step4.png'

import styles from './CreatorHubUpgradeModal.module.css'

type Variant = CreatorHubUpgradeModalMetadata['variant']

const CREATOR_HUB_DOWNLOAD_URL = 'https://decentraland.org/download/creator-hub/'

const VARIANT_CONFIG: Record<string, { images: [string, string]; translationPrefix: string }> = {
  permissions: { images: [accessImg, collaborationImg], translationPrefix: 'creator_hub_upgrade_modal.permissions_variant' },
  default: { images: [codeImg, publishImg], translationPrefix: 'creator_hub_upgrade_modal' }
}

function getVariant(variant?: Variant) {
  return VARIANT_CONFIG[variant ?? 'default']
}

const CreatorHubUpgradeModal: React.FC<Props> = ({ name, onClose, metadata }) => {
  const dispatch = useDispatch()
  const handleSkip = useCallback(() => {
    onClose()
    if (metadata?.worldName) {
      dispatch(
        openModal('WorldPermissionsModal', { worldName: metadata.worldName, isCollaboratorsTabShown: metadata.isCollaboratorsTabShown })
      )
    }
  }, [onClose, dispatch, metadata])

  const handleDownload = useCallback(() => {
    window.open(CREATOR_HUB_DOWNLOAD_URL, '_blank', 'noopener,noreferrer')
    onClose()
  }, [onClose])

  const { images, translationPrefix } = getVariant(metadata?.variant)

  return (
    <Modal name={name} onClose={handleSkip} size="large" className={styles.modal}>
      <div className={styles.modalBody}>
        <img src={coverImg} alt="" className={styles.coverImage} />
        <div className={styles.contentColumn}>
          <div className={styles.header}>
            <h2 className={styles.title}>{t(`${translationPrefix}.title`)}</h2>
          </div>

          <ModalContent className={styles.content}>
            <p className={styles.description}>{t(`${translationPrefix}.description`)}</p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <img src={images[0]} alt="" className={styles.featureImage} />
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>{t(`${translationPrefix}.feature1.title`)}</h3>
                  <p className={styles.featureDescription}>{t(`${translationPrefix}.feature1.description`)}</p>
                </div>
              </div>
              <div className={styles.feature}>
                <img src={images[1]} alt="" className={styles.featureImage} />
                <div className={styles.featureContent}>
                  <h3 className={styles.featureTitle}>{t(`${translationPrefix}.feature2.title`)}</h3>
                  <p className={styles.featureDescription}>{t(`${translationPrefix}.feature2.description`)}</p>
                </div>
              </div>
            </div>
          </ModalContent>

          <ModalActions className={styles.actions}>
            <Button secondary onClick={handleSkip}>
              {t('creator_hub_upgrade_modal.skip_for_now')}
            </Button>
            <Button primary onClick={handleDownload}>
              {t('creator_hub_upgrade_modal.download')}
            </Button>
          </ModalActions>
        </div>
      </div>
    </Modal>
  )
}

export default React.memo(CreatorHubUpgradeModal)
