import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Field, Icon as DCLIcon, SelectField } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import { locations } from 'routing/locations'
import { Project } from 'modules/project/types'
import Icon from 'components/Icon'
import { DeployToWorldView, Props } from './DeployToWorld.types'
import styles from './DeployToWorld.module.css'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'

const EXPLORER_URL = config.get('EXPLORER_URL', '')
const WORLDS_CONTENT_SERVER = config.get('WORLDS_CONTENT_SERVER', '')
const CLAIM_NAME_OPTION = 'claim_name_option'

export default function DeployToWorld({
  name,
  project,
  ensList,
  deploymentProgress,
  isLoading,
  onPublish,
  onNavigate,
  onClose,
  onBack
}: Props) {
  const [view, setView] = useState<string>('')
  const [world, setWorld] = useState<string>('')

  useEffect(() => {
    if (ensList.length === 0) {
      setView(DeployToWorldView.EMPTY)
    } else {
      setView(DeployToWorldView.FORM)
    }
  }, [ensList])

  useEffect(() => {
    if (view === DeployToWorldView.FORM && world && deploymentProgress.stage === 2 && deploymentProgress.value === 100) {
      setView(DeployToWorldView.SUCCESS)
    }
  }, [view, world, deploymentProgress])

  const handlePublish = useCallback(() => {
    if (world) {
      onPublish((project as Project).id, world)
    }
  }, [onPublish, project, world])

  const handleClaimName = useCallback(() => {
    onNavigate(locations.claimENS())
  }, [onNavigate])

  const handleWorldSelected = useCallback((_, { value }) => {
    if (value === CLAIM_NAME_OPTION) {
      // TODO: Add claim name flow
      return
    }

    setWorld(value)
  }, [])

  const handleNavigateToExplorer = () => {
    window.open(getExplorerUrl, '_blank,noreferrer')
  }

  const handleShareInTwitter = useCallback(() => {
    console.log('Share in Twitter')
  }, [])

  const getExplorerUrl = useMemo(() => {
    return `${EXPLORER_URL}/?realm=${WORLDS_CONTENT_SERVER}/${world}`
  }, [world])

  const worldOptions = useMemo(() => {
    return [
      ...ensList.map(ens => ({ text: ens.name, value: ens.subdomain })),
      { text: t('deployment_modal.deploy_world.claim_name'), value: CLAIM_NAME_OPTION }
    ]
  }, [ensList])

  const renderEmptyState = () => {
    return (
      <>
        <div className={styles.modalHeader}>
          <h3>{t('deployment_modal.deploy_world.title')}</h3>
        </div>
        <div className={`${styles.modalBodyState} ${styles.modalBodyEmptyState}`}>
          <div className={styles.emptyThumbnail} aria-label={project?.description} role="img" />
          <span className={styles.description}>
            {t('deployment_modal.deploy_world.empty_state_description', {
              br: () => <br />,
              b: (text: string) => <b>{text}</b>
            })}
          </span>
        </div>
        <div className={styles.modalBodyStateActions}>
          <Button primary className={styles.modalBodyStateActionButton} onClick={handleClaimName}>
            {t('deployment_modal.deploy_world.claim_name')}
          </Button>
          <Button
            secondary
            className={styles.modalBodyStateActionButton}
            as="a"
            href="https://decentraland.org/blog/project-updates/manage-names-in-the-builder"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('global.learn_more')}
          </Button>
        </div>
      </>
    )
  }

  const renderSuccessState = () => {
    return (
      <>
        <div className={`${styles.modalBodyState} ${styles.modalBodySuccessState}`}>
          <div className={styles.successImage} aria-label={project?.description} role="img" />
          <h1 className={styles.modalHeader}>{t('deployment_modal.deploy_world.success.title')}</h1>
          <span className={styles.description}>{t('deployment_modal.deploy_world.success.subtitle')}</span>
          <CopyToClipboard role="button" text={getExplorerUrl} className={`${styles.shareUrlField} field`}>
            <Field
              className={styles.shareUrlFieldInput}
              value={getExplorerUrl}
              kind="full"
              readOnly
              icon={<DCLIcon aria-label="Copy World" aria-hidden="false" className="link copy" name="copy outline" />}
            />
          </CopyToClipboard>
        </div>
        <div className={styles.modalBodyStateActions}>
          <Button
            primary
            className={styles.modalBodyStateActionButton}
            onClick={handleNavigateToExplorer}
            content={t('deployment_modal.deploy_world.success.jump_in')}
            icon="external alternate"
          />
          <Button
            secondary
            className={styles.modalBodyStateActionButton}
            content={t('deployment_modal.deploy_world.success.share_in_twitter')}
            icon="twitter"
            onClick={handleShareInTwitter}
          />
        </div>
      </>
    )
  }

  const renderForm = () => {
    const thumbnailUrl: string = project?.thumbnail ?? ''

    return (
      <>
        <div className={styles.modalHeader}>
          <h3>{t('deployment_modal.deploy_world.title')}</h3>
          <span>{t('deployment_modal.deploy_world.description')}</span>
        </div>
        <div className={styles.modalForm}>
          {thumbnailUrl ? (
            <div
              className={styles.thumbnail}
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
              aria-label={project?.description}
              role="img"
            />
          ) : null}
          <SelectField
            label={t('deployment_modal.deploy_world.world_label')}
            placeholder={t('deployment_modal.deploy_world.world_placeholder')}
            value={world}
            options={worldOptions}
            onChange={handleWorldSelected}
          />
        </div>
        <Button primary className={styles.actionButton} onClick={handlePublish} loading={isLoading} disabled={isLoading || !world}>
          {t('deployment_modal.deploy_world.action')}
        </Button>
      </>
    )
  }

  const renderStep = () => {
    switch (view) {
      case DeployToWorldView.FORM:
        return renderForm()
      case DeployToWorldView.SUCCESS:
        return renderSuccessState()
      case DeployToWorldView.EMPTY:
        return renderEmptyState()
      default:
        return null
    }
  }

  return (
    <Modal name={name} onClose={onClose}>
      <div className={styles.modalBody}>
        <div className={styles.modalNavigation}>
          <button className={styles.navigationButton} onClick={onBack} aria-label={t('deployment_modal.deploy_world.back')}>
            <Icon name="modal-back" />
          </button>
          <button className={styles.navigationButton} onClick={onClose} aria-label={t('deployment_modal.deploy_world.close')}>
            <Icon name="modal-close" />
          </button>
        </div>
        {renderStep()}
      </div>
    </Modal>
  )
}
