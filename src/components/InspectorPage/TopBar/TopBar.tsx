import { useCallback, useMemo } from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Icon, Popup } from 'decentraland-ui'
import { SceneMetrics } from '@dcl/inspector/dist/redux/scene-metrics/types'
import { Env } from '@dcl/ui-env'
import { config } from 'config'
import OwnIcon from 'components/Icon'
import DeploymentStatus from 'components/DeploymentStatus'
import { DeployModalView } from 'components/Modals/DeployModal/DeployModal.types'
import { DeployToWorldModalMetadata } from 'components/Modals/DeployModal/DeployToWorld/DeployToWorld.types'
import { Props } from './TopBar.types'
import styles from './TopBar.module.css'

const EXPLORER_URL = config.get('EXPLORER_URL', '')
const BUILDER_SERVER_URL = config.get('BUILDER_SERVER_URL', '')

export default function TopBar({ currentProject, metrics, limits, areEntitiesOutOfBoundaries, isUploading, onBack, onOpenModal }: Props) {
  const handleDownload = useCallback(() => {
    onOpenModal('ExportModal', { project: currentProject })
  }, [currentProject, onOpenModal])

  const handleEditProject = useCallback(() => {
    onOpenModal('EditProjectModal')
  }, [onOpenModal])

  const handlePublish = useCallback(() => {
    onOpenModal('DeployModal', {
      view: DeployModalView.NONE,
      projectId: currentProject!.id
    } as DeployToWorldModalMetadata)
  }, [onOpenModal, currentProject])

  const previewUrl = useMemo(() => {
    if (!currentProject) {
      return ''
    }

    const url = new URL(EXPLORER_URL)

    url.searchParams.set('skipSetup', 'true')
    url.searchParams.set('realm', `${BUILDER_SERVER_URL}/projects/${currentProject.id}`)
    url.searchParams.set('DEBUG_MODE', 'true')
    if (config.is(Env.DEVELOPMENT)) {
      url.searchParams.set('NETWORK', 'sepolia')
      url.searchParams.set('DEBUG_SCENE_LOG', '')
    }

    return url.toString()
  }, [])

  const someMetricExceedsLimit = useMemo(
    () => Object.keys(metrics).some(key => metrics[key as keyof SceneMetrics] > limits[key as keyof SceneMetrics]),
    [metrics]
  )

  const isPublishDisabled = useMemo(() => {
    return isUploading || areEntitiesOutOfBoundaries || someMetricExceedsLimit
  }, [metrics, limits, areEntitiesOutOfBoundaries, someMetricExceedsLimit, isUploading])

  const isPopupDisabled = useMemo(() => isUploading || !isPublishDisabled, [isUploading, isPublishDisabled])

  const renderPopupContent = useCallback(() => {
    if (areEntitiesOutOfBoundaries) return t('topbar.bounds_exceeded', { br: <br /> })
    if (someMetricExceedsLimit) return t('topbar.limits_exceeded')
    return null
  }, [areEntitiesOutOfBoundaries, someMetricExceedsLimit])

  return (
    <div className={styles.container}>
      <div className={styles.nameContainer}>
        <Button basic aria-label={t('inspector.top_bar.back')} onClick={onBack}>
          <Icon name="chevron left" />
        </Button>
        {currentProject && (
          <Button basic onClick={handleEditProject} disabled={isUploading} className={styles.editNameBtn}>
            {currentProject.title}
            <OwnIcon name="layout" className="edit-project-icon" />
          </Button>
        )}
        {isUploading && <OwnIcon name="cloud-upload" className="cloud-upload-indicator is-uploading" />}
      </div>
      <div className={styles.actions}>
        {currentProject ? <DeploymentStatus projectId={currentProject.id} /> : null}
        <Popup
          content={t('inspector.top_bar.download')}
          trigger={
            <Button
              secondary
              aria-label={t('inspector.top_bar.download')}
              size="small"
              className={styles.downloadBtn}
              disabled={isUploading}
              onClick={handleDownload}
            >
              <Icon name="download" />
            </Button>
          }
        />
        <Button as="a" href={previewUrl} target="_blank" secondary size="small" disabled={isUploading}>
          <Icon name="eye" />
          {t('inspector.top_bar.preview')}
        </Button>
        <Popup
          content={renderPopupContent()}
          position="bottom center"
          disabled={isPopupDisabled}
          trigger={
            <span>
              <Button primary size="small" disabled={isPublishDisabled} onClick={handlePublish}>
                <Icon name="globe" />
                {t('inspector.top_bar.publish')}
              </Button>
            </span>
          }
          on="hover"
        />
      </div>
    </div>
  )
}
