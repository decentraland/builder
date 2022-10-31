import React from 'react'
import { Button, Column, Modal, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Collection } from 'modules/collection/types'
import './CongratulationsStep.css'

export const CongratulationsStep: React.FC<{ collection: Collection }> = props => {
  const { collection } = props

  return (
    <Modal.Content className="CongratulationsStep">
      <Column>
        <Row className="details">
          <Column grow={true}>
            <i className="sparkles"></i>
            <span>{t('publish_wizard_collection_modal.congratulations_step.title')}</span>
            <span>
              {t('publish_wizard_collection_modal.congratulations_step.subtitle', {
                forum_post: (
                  <a className="forum-post" href={collection.forumLink}>
                    {t('publish_wizard_collection_modal.congratulations_step.forum_post')}
                  </a>
                )
              })}
            </span>
            <p className="description">{t('publish_wizard_collection_modal.congratulations_step.description')}</p>
          </Column>
        </Row>
        <Row className="actions" align="right">
          <Button className="proceed" primary href={collection.forumLink}>
            {t('publish_wizard_collection_modal.congratulations_step.view_forum_post')}
          </Button>
        </Row>
      </Column>
    </Modal.Content>
  )
}

export default CongratulationsStep
