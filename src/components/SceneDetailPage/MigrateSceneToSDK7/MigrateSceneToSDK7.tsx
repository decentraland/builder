import { useCallback, useMemo, useState } from 'react'
import { Button, Checkbox, Loader, Modal, ModalActions, ModalContent, ModalNavigation } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import automaticMigrateImg from 'images/automatic_migrate.webp'
import migrateWithSmartItemsImg from 'images/migrate_smart_items.webp'
import infoImg from 'images/web-editor-image.webp'
import { MigrateStep, Props } from './MigrateSceneToSDK7.types'
import { getSmartItemsCount } from './utils'
import styles from './MigrateSceneToSDK7.module.css'

export default function MigrateSceneToSDK7({
  project,
  scene,
  isLoading,
  isSavingSDK6Copy,
  isSavingScene,
  onNavigate,
  onClose,
  onMigrateScene
}: Props) {
  const [step, setStep] = useState(MigrateStep.INFO)
  const [saveCopy, setSaveCopy] = useState(false)

  const hasSmartItems = useMemo(() => {
    return getSmartItemsCount(scene) > 0
  }, [scene])

  const handleBack = useCallback(() => {
    setStep(MigrateStep.INFO)
  }, [])

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose()
    }
  }, [isLoading, onClose])

  const getImgSrc = useCallback(() => {
    switch (step) {
      case MigrateStep.INFO:
        return infoImg
      case MigrateStep.MIGRATE:
        if (project?.thumbnail) {
          return project.thumbnail
        }
        if (hasSmartItems) {
          return migrateWithSmartItemsImg
        }
        return automaticMigrateImg
    }
  }, [step, hasSmartItems, project])

  const handleAction = useCallback(() => {
    switch (step) {
      case MigrateStep.INFO:
        setStep(MigrateStep.MIGRATE)
        break
      case MigrateStep.MIGRATE:
        project && onMigrateScene(project, saveCopy)
        break
    }
  }, [step, saveCopy, project, onMigrateScene])

  const getAdditionalSubtitleProperties = () => {
    if (step === MigrateStep.MIGRATE && hasSmartItems) {
      return { smartItemsCount: getSmartItemsCount(scene) }
    }
    return {}
  }

  const renderAction = () => {
    if (!isLoading || step !== MigrateStep.MIGRATE) {
      return (
        <Button disabled={isLoading} primary onClick={handleAction}>
          {t(`migrate_to_sdk7_modal.${stepKey}.action`)}
        </Button>
      )
    }

    if (isSavingSDK6Copy) {
      return (
        <span className={styles.loadingMessage}>
          <Loader size="tiny" inline className={styles.loader} />
          {t('migrate_to_sdk7_modal.saving_copy')}
        </span>
      )
    }

    if (isSavingScene) {
      return (
        <span className={styles.loadingMessage}>
          <Loader size="tiny" />
          {t('migrate_to_sdk7_modal.migrating_scene')}
        </span>
      )
    }

    return null
  }

  const stepKey = hasSmartItems ? `${step}_smart_items` : step
  const showSecondaryActionBtn = !isLoading && (step !== MigrateStep.MIGRATE || hasSmartItems)
  return (
    <Modal open className={styles.modalContainer} onClose={handleClose}>
      <ModalNavigation
        title={t(`migrate_to_sdk7_modal.${stepKey}.title`)}
        onBack={step !== MigrateStep.INFO ? handleBack : undefined}
        onClose={handleClose}
      />
      <ModalContent className={styles.content}>
        <p className={styles.subtitle}>
          {t(`migrate_to_sdk7_modal.${stepKey}.subtitle`, {
            b: (str: string) => <b>{str}</b>,
            br: () => <br />,
            ...getAdditionalSubtitleProperties()
          })}
        </p>
        <div
          style={{
            width: '648px',
            height: '324px',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundImage: `url(${getImgSrc()}`
          }}
        />
        {step === MigrateStep.MIGRATE && (
          <Checkbox
            disabled={isLoading}
            checked={saveCopy}
            label={t('migrate_to_sdk7_modal.save_a_copy')}
            onChange={(_, { checked }) => {
              setSaveCopy(!!checked)
            }}
          />
        )}
      </ModalContent>
      <ModalActions className={styles.actions}>
        {renderAction()}
        {showSecondaryActionBtn && (
          <Button disabled={isLoading} secondary onClick={() => onNavigate(locations.sceneEditor(project?.id))}>
            {t('migrate_to_sdk7_modal.use_legacy_builder')}
          </Button>
        )}
      </ModalActions>
    </Modal>
  )
}
