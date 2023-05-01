import { useCallback, useMemo, useState } from 'react'
import { Button, SelectField } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import Icon from 'components/Icon'
import { Props } from './DeployToWorld.types'
import styles from './DeployToWorld.module.css'

const CLAIM_NAME_OPTION = 'claim_name_option'

export default function DeployToWorld({ name, project, ensList, isLoading, onPublish, onNavigate, onClose, onBack }: Props) {
  const [world, setWorld] = useState<string>()
  const thumbnailUrl: string = project?.thumbnail || ''

  const handlePublish = useCallback(() => {
    if (world) {
      onPublish(project?.id as string, world)
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
        <div className={styles.modalBodyEmptyState}>
          <div className={styles.emptyThumbnail} aria-label={project?.description} role="img" />
          <span className={styles.description}>
            {t('deployment_modal.deploy_world.empty_state_description', {
              br: () => <br />,
              b: (text: string) => <b>{text}</b>
            })}
          </span>
        </div>
        <div className={styles.modalBodyEmptyStateActions}>
          <Button primary className={styles.modalBodyEmptyStateActionButton} onClick={handleClaimName}>
            {t('deployment_modal.deploy_world.claim_name')}
          </Button>
          <Button
            secondary
            className={styles.modalBodyEmptyStateActionButton}
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
        {ensList.length > 0 ? (
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
        ) : (
          renderEmptyState()
        )}
      </div>
    </Modal>
  )
}
