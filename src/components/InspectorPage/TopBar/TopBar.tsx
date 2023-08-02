import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Icon, Popup } from 'decentraland-ui'
import OwnIcon from 'components/Icon'
import { Props } from './TopBar.types'
import styles from './TopBar.module.css'
import { useCallback } from 'react'
import DeploymentStatus from 'components/DeploymentStatus'

export default function TopBar({ currentProject, isUploading, onBack, onOpenModal }: Props) {
  const handleEditProject = useCallback(() => {
    onOpenModal('EditProjectModal')
  }, [onOpenModal])

  const handlePublish = useCallback(() => {
    console.error('TODO: Add publish project action')
  }, [])

  const handlePreview = useCallback(() => {
    console.error('TODO: Add preview project action')
  }, [])

  const handleDownload = useCallback(() => {
    console.error('TODO: Add download project action')
  }, [])

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
        <Button secondary size="small" disabled={isUploading} onClick={handlePreview}>
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
