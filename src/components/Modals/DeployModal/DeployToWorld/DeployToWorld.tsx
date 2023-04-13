import { useCallback, useMemo, useState } from 'react'
import { Button, SelectField } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Icon from 'components/Icon'
import { Props } from './DeployToWorld.types'
import styles from './DeployToWorld.module.css'

const CLAIM_NAME_OPTION = 'claim_name_option'

export default function DeployToWorld({ name, project, ensList, isLoading, onPublish, onClose, onBack }: Props) {
  const [world, setWorld] = useState<string>()
  const thumbnailUrl: string = project?.thumbnail || ''

  const handlePublish = useCallback(() => {
    if (world) {
      onPublish(project?.id as string, world)
    }
  }, [onPublish, project, world])

  const handleWorldSelected = useCallback((_, { value }) => {
    if (value === CLAIM_NAME_OPTION) {
      // TODO: Add claim name flow
      return
    }

    setWorld(value)
  }, [])

  const worldOptions = useMemo(() => {
    return [
      ...ensList.map(ens => ({ text: ens.name, value: ens.name })),
      { text: t('deployment_modal.deploy_world.claim_name'), value: CLAIM_NAME_OPTION }
    ]
  }, [ensList])

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
        <Button primary className={styles.actionButton} onClick={handlePublish} loading={isLoading} disabled={isLoading}>
          {t('deployment_modal.deploy_world.action')}
        </Button>
      </div>
    </Modal>
  )
}
