import { useCallback } from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Icon, Popup } from 'decentraland-ui'
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

export default function TopBar({ currentProject, isUploading, onBack, onOpenModal }: Props) {
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

  const previewUrl = currentProject
    ? `${EXPLORER_URL}?realm=${BUILDER_SERVER_URL}/projects/${currentProject.id}${config.is(Env.DEVELOPMENT) ? '&NETWORK=sepolia' : ''}`
    : ''
  return (
    <div className={styles.container}>
      <div className={styles.nameContainer}>
        <Button basic aria-label={t('inspector.top_bar.back')} onClick={onBack}>
          <Icon name="chevron left" />
        </Button>
        {currentProject && (
          <Button basic onClick={handleEditProject} disabled={isUploading} className={styles.editNameBtn}>
            {currentProject.title}
            <OwnIcon name="edit" className="edit-project-icon" />
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
        <Button primary size="small" disabled={isUploading} onClick={handlePublish}>
          <Icon name="globe" />
          {t('inspector.top_bar.publish')}
        </Button>
      </div>
    </div>
  )
}
