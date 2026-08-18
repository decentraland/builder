import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Button, Icon, ModalActions, ModalContent } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import { Props, CreatorHubUpgradeModalMetadata } from './CreatorHubUpgradeModal.types'
import sunsetCover from 'images/creator-hub-sunset-cover.png'
import codeIcon from 'images/creator-hub-icon-code.svg'
import previewIcon from 'images/creator-hub-icon-preview.svg'

import styles from './CreatorHubUpgradeModal.module.css'

type Variant = CreatorHubUpgradeModalMetadata['variant']

const CREATOR_HUB_DOWNLOAD_URL = config.get('CREATOR_HUB_DOWNLOAD_URL')

const VARIANT_CONFIG: Record<string, { leftImage: string; icons: [string, string]; translationPrefix: string }> = {
  permissions: {
    leftImage: sunsetCover,
    icons: [codeIcon, previewIcon],
    translationPrefix: 'creator_hub_upgrade_modal.permissions_variant'
  },
  default: { leftImage: sunsetCover, icons: [codeIcon, previewIcon], translationPrefix: 'creator_hub_upgrade_modal' }
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

  const { leftImage, icons, translationPrefix } = getVariant(metadata?.variant)

  return (
    <Modal name={name} onClose={handleSkip} size="large" className={styles.modal}>
      <div className={styles.modalBody}>
        <img src={leftImage} alt="" className={styles.coverImage} />
        <div className={styles.contentColumn}>
          <span className={styles.badge}>{t(`${translationPrefix}.badge`)}</span>
          <h2 className={styles.title}>{t(`${translationPrefix}.title`)}</h2>
          <p className={styles.subtitle}>{t(`${translationPrefix}.subtitle`)}</p>

          <ModalContent className={styles.content}>
            <p className={styles.description}>
              {t(`${translationPrefix}.description`, {
                link: (content: string) => (
                  <Button basic className={styles.inlineLink} onClick={handleDownload}>
                    {content}
                  </Button>
                )
              })}
            </p>

            <h3 className={styles.whySwitch}>{t(`${translationPrefix}.why_switch`)}</h3>

            <div className={styles.features}>
              <div className={styles.feature}>
                <img src={icons[0]} alt="" className={styles.featureIcon} />
                <div className={styles.featureContent}>
                  <h4 className={styles.featureTitle}>{t(`${translationPrefix}.feature1.title`)}</h4>
                  <p className={styles.featureDescription}>{t(`${translationPrefix}.feature1.description`)}</p>
                </div>
              </div>
              <div className={styles.feature}>
                <img src={icons[1]} alt="" className={styles.featureIcon} />
                <div className={styles.featureContent}>
                  <h4 className={styles.featureTitle}>{t(`${translationPrefix}.feature2.title`)}</h4>
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
              <Icon name="download" />
              {t('creator_hub_upgrade_modal.download')}
            </Button>
          </ModalActions>

          <p className={styles.footerNote}>{t(`${translationPrefix}.footer_note`)}</p>
        </div>
      </div>
    </Modal>
  )
}

export default React.memo(CreatorHubUpgradeModal)
