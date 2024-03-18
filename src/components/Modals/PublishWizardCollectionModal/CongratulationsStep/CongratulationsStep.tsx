import React from 'react'
import { Button, Column, Modal, Row } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Collection } from 'modules/collection/types'
import './CongratulationsStep.css'
import CollectionImage from 'components/CollectionImage'

export const CongratulationsStep: React.FC<{ collection: Collection; onClose: () => void }> = props => {
  const { collection, onClose } = props

  return (
    <Modal.Content className="CongratulationsStep">
      <Column>
        <Row className="details">
          <Column>
            <CollectionImage className="collection-image" collectionId={collection.id} />
            <div className="texts-container">
              <span className="title">{t('publish_wizard_collection_modal.congratulations_step.title')}</span>
              <div className="subtitle-container">
                <span className="dot"></span>
                <span className="subtitle">
                  {t('publish_wizard_collection_modal.congratulations_step.subtitle', {
                    forum_post: (
                      <a className="forum-post" href={collection.forumLink} rel="noopener noreferrer" target="_blank">
                        {t('publish_wizard_collection_modal.congratulations_step.forum_post')}
                      </a>
                    )
                  })}
                </span>
              </div>
              <div className="description-container">
                <span className="dot"></span>
                <p className="description">
                  <T
                    id="publish_wizard_collection_modal.congratulations_step.description"
                    values={{
                      b: (chunks: string) => <strong>{chunks}</strong>
                    }}
                  ></T>
                </p>
              </div>
            </div>
          </Column>
        </Row>
        <Row className="actions" align="right">
          <Button className="finish" secondary onClick={onClose}>
            {t('global.finish')}
          </Button>
          <Button className="proceed" primary as="a" href={collection.forumLink} target="_blank" rel="noopener noreferrer">
            {t('publish_wizard_collection_modal.congratulations_step.view_forum_post')}
          </Button>
        </Row>
      </Column>
    </Modal.Content>
  )
}

export default CongratulationsStep
