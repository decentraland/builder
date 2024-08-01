import { Modal, ModalNavigation, Progress } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation'
import { Props } from './PublishingStep.types'
import styles from './PublishingStep.module.css'

export const PublishingStep = (props: Props) => {
  const { pushChangesProgress } = props

  return (
    <>
      <ModalNavigation title={''} onClose={undefined} />
      <Modal.Content>
        <div className={styles.content}>
          <Progress percent={pushChangesProgress} className={styles.progressBar} active progress />
          <h2>{t('publish_third_party_collection_modal.publishing_step.message')}</h2>
        </div>
      </Modal.Content>
    </>
  )
}
