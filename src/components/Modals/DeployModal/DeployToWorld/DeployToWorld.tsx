import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { Button, Field, Icon as DCLIcon, SelectField, Checkbox, Row, Popup, List } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import { isDevelopment } from 'lib/environment'
import { locations } from 'routing/locations'
import { Deployment } from 'modules/deployment/types'
import { FromParam } from 'modules/location/types'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import Icon from 'components/Icon'
import { InfoIcon } from 'components/InfoIcon'
import { DeployToWorldView, Props } from './DeployToWorld.types'

import styles from './DeployToWorld.module.css'

const EXPLORER_URL = config.get('EXPLORER_URL', '')
const WORLDS_CONTENT_SERVER_URL = config.get('WORLDS_CONTENT_SERVER', '')
const CLAIM_NAME_OPTION = 'claim_name_option'

export default function DeployToWorld({
  name,
  project,
  metrics,
  ensList,
  deployments,
  isLoading,
  error,
  claimedName,
  onPublish,
  onRecord,
  onNavigate,
  onReplace,
  onClose,
  onBack
}: Props) {
  const [view, setView] = useState<string>('')
  const [world, setWorld] = useState<string>(claimedName ?? '')
  const [loading, setLoading] = useState<boolean>(false)
  const [confirmWorldReplaceContent, setConfirmWorldReplaceContent] = useState<boolean>(false)
  // Ref used to store current world deployment status and validate if the user is trying to deploy the same world
  const currentDeployment = useRef<Deployment | undefined>()

  const currenWorldLabel = world && ensList.find(ens => ens.subdomain === world)?.name

  useEffect(() => {
    if (ensList.length === 0) {
      setView(DeployToWorldView.EMPTY)
    } else {
      setView(DeployToWorldView.FORM)
      onRecord()
    }
  }, [ensList, onRecord])

  useEffect(() => {
    if (view === DeployToWorldView.FORM && loading && error) {
      setView(DeployToWorldView.ERROR)
      setLoading(false)
    } else if (
      view === DeployToWorldView.FORM &&
      world &&
      loading &&
      (currentDeployment.current ? deployments[world].timestamp > currentDeployment.current.timestamp : !!deployments[world])
    ) {
      setView(DeployToWorldView.SUCCESS)
      setLoading(false)
    }
  }, [view, world, loading, error, deployments])

  const handlePublish = useCallback(() => {
    if (world) {
      onPublish(project.id, world)
      setLoading(true)
    }
  }, [onPublish, project, world])

  const handleClose = useCallback(() => {
    if (view === DeployToWorldView.SUCCESS) {
      onNavigate(locations.sceneDetail(project.id))
    }
    if (isLoading) {
      return
    }
    onClose()
  }, [view, project, isLoading, onClose, onNavigate])

  const handleClaimName = useCallback(() => {
    const ensUrl = `${locations.claimENS()}?from=${FromParam.DEPLOY_TO_WORLD}&projectId=${project.id}`
    onReplace(ensUrl, { fromParam: FromParam.DEPLOY_TO_WORLD, projectId: project.id })
  }, [project, onReplace])

  const handleWorldSelected = useCallback(
    (_, { value }) => {
      if (value === CLAIM_NAME_OPTION) {
        handleClaimName()
        return
      }

      setWorld(value)
      setConfirmWorldReplaceContent(false)
      currentDeployment.current = deployments[value]
    },
    [deployments, handleClaimName]
  )

  const handleNavigateToExplorer = () => {
    window.open(getExplorerUrl, '_blank,noreferrer')
  }

  const handleConfirmWorldReplaceContent = useCallback((_, { checked }) => {
    setConfirmWorldReplaceContent(checked)
  }, [])

  const getExplorerUrl = useMemo(() => {
    if (isDevelopment) {
      return `${EXPLORER_URL}/?realm=${WORLDS_CONTENT_SERVER_URL}/world/${world}&NETWORK=goerli`
    }
    return `${EXPLORER_URL}/world/${world}`
  }, [world])

  const worldOptions = useMemo(() => {
    return [
      ...ensList.map(ens => ({ text: ens.name, value: ens.subdomain })),
      {
        text: (
          <span>
            <DCLIcon name="add" />
            {t('deployment_modal.deploy_world.claim_name')}
          </span>
        ),
        value: CLAIM_NAME_OPTION
      }
    ]
  }, [ensList])

  const getShareInTwitterUrl = () => {
    const url = encodeURIComponent(getExplorerUrl)
    const text = encodeURIComponent(t('deployment_modal.deploy_world.success.share_in_twitter_text'))

    return `https://twitter.com/intent/tweet?text=${text}&url=${url}`
  }

  const renderEmptyState = () => {
    return (
      <div className={styles.emptyState}>
        <div className={styles.modalHeader}>
          <h3>{t('deployment_modal.deploy_world.empty_state_title')}</h3>
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
      </div>
    )
  }

  const renderSuccessState = () => {
    return (
      <>
        <div className={`${styles.modalBodyState} ${styles.modalBodySuccessState}`}>
          <div className={styles.successImage} aria-label={project?.description} role="img" />
          <h1 className={styles.modalHeader}>{t('deployment_modal.deploy_world.success.title')}</h1>
          <span className={styles.description}>{t('deployment_modal.deploy_world.success.subtitle')}</span>
          <CopyToClipboard role="button" text={getExplorerUrl} className={`${styles.shareUrlField} field`} showPopup={true}>
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
            as="a"
            secondary
            className={styles.modalBodyStateActionButton}
            content={t('deployment_modal.deploy_world.success.share_in_twitter')}
            icon="twitter"
            href={getShareInTwitterUrl()}
            rel="noopener noreferrer"
            target="_blank"
          />
        </div>
      </>
    )
  }

  const renderFailureState = () => {
    return (
      <div className={`${styles.modalBodyState} ${styles.modalBodyFailureState}`}>
        <div className={styles.failureImage} aria-label={project?.description} role="img" />
        <h1 className={styles.modalHeader}>{t('deployment_modal.deploy_world.failure.title')}</h1>
        <span className={styles.description}>{t('deployment_modal.deploy_world.failure.subtitle')}</span>
      </div>
    )
  }

  const renderMetrics = () => {
    const { rows, cols } = project.layout
    return (
      <div className={styles.metrics}>
        <strong>{t('deployment_modal.deploy_world.scene_information')}:</strong>
        <List className={styles.metricsList}>
          <List.Item>
            {t('global.size')}: {rows} x {cols}
          </List.Item>
          <List.Item>
            {t('metrics.triangles')}: {metrics.triangles}
          </List.Item>
          <List.Item>
            {t('metrics.materials')}: {metrics.materials}
          </List.Item>
          <List.Item>
            {t('metrics.meshes')}: {metrics.meshes}
          </List.Item>
          <List.Item>
            {t('metrics.bodies')}: {metrics.bodies}
          </List.Item>
          <List.Item>
            {t('metrics.entities')}: {metrics.entities}
          </List.Item>
          <List.Item>
            {t('metrics.textures')}: {metrics.textures}
          </List.Item>
        </List>
      </div>
    )
  }

  const renderThumbnail = () => {
    const thumbnailUrl = project.thumbnail
    return (
      <div className={styles.thumbnail} style={{ backgroundImage: `url(${thumbnailUrl})` }} aria-label={project?.description} role="img">
        <Popup
          className="modal-tooltip"
          content={renderMetrics()}
          position="bottom center"
          trigger={<InfoIcon className={styles.thumbnailInfo} />}
          hideOnScroll={true}
          on="hover"
          inverted
          basic
        />
      </div>
    )
  }

  const renderForm = () => {
    const hasWorldContent = !!deployments[world]
    return (
      <>
        <div className={styles.modalHeader}>
          <h3>{t('deployment_modal.deploy_world.title')}</h3>
          <span>{t('deployment_modal.deploy_world.description')}</span>
        </div>
        <div className={styles.modalForm}>
          {project?.thumbnail ? renderThumbnail() : null}
          <div className={styles.worldDetails}>
            <SelectField
              label={t('deployment_modal.deploy_world.world_label')}
              placeholder={t('deployment_modal.deploy_world.world_placeholder')}
              value={world}
              options={worldOptions}
              onChange={handleWorldSelected}
            />
            {world ? (
              <>
                <p className={styles.worldDetailsDescription}>
                  {t('deployment_modal.deploy_world.world_url_description', {
                    br: () => <br />,
                    b: (text: string) => <b>{text}</b>,
                    world_url: getExplorerUrl
                  })}
                </p>
                {hasWorldContent ? (
                  <div className={styles.worldHasContent}>
                    <Icon name="alert-warning" />
                    <span>{t('deployment_modal.deploy_world.world_has_content', { world: currenWorldLabel })}</span>
                  </div>
                ) : null}
              </>
            ) : undefined}
          </div>
        </div>
        <Row className={styles.modalFormActions} align="right">
          {hasWorldContent ? (
            <div className={styles.actionCheckbox}>
              <Checkbox checked={confirmWorldReplaceContent} onClick={handleConfirmWorldReplaceContent} disabled={isLoading || loading} />
              {t('deployment_modal.deploy_world.confirm_world_replace_content')}
            </div>
          ) : null}
          <Button
            primary
            className={styles.actionButton}
            onClick={handlePublish}
            loading={isLoading || loading}
            disabled={isLoading || loading || !world || (hasWorldContent && !confirmWorldReplaceContent)}
          >
            {t('deployment_modal.deploy_world.action')}
          </Button>
        </Row>
      </>
    )
  }

  const renderStep = () => {
    switch (view) {
      case DeployToWorldView.FORM:
        return renderForm()
      case DeployToWorldView.SUCCESS:
        return renderSuccessState()
      case DeployToWorldView.ERROR:
        return renderFailureState()
      case DeployToWorldView.EMPTY:
        return renderEmptyState()
      default:
        return null
    }
  }

  return (
    <Modal name={name} onClose={handleClose}>
      <div className={styles.modalBody}>
        <div className={classNames(styles.modalNavigation, { [styles.end]: view === DeployToWorldView.SUCCESS })}>
          {view !== DeployToWorldView.SUCCESS && (
            <button
              className={styles.navigationButton}
              disabled={isLoading}
              onClick={onBack}
              aria-label={t('deployment_modal.deploy_world.back')}
            >
              <Icon name="modal-back" />
            </button>
          )}
          <button
            className={styles.navigationButton}
            disabled={isLoading}
            onClick={handleClose}
            aria-label={t('deployment_modal.deploy_world.close')}
          >
            <Icon name="modal-close" />
          </button>
        </div>
        {renderStep()}
      </div>
    </Modal>
  )
}
