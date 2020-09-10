import * as React from 'react'
import { ModalNavigation, Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props } from './PublishCollectionModal.types'
import './PublishCollectionModal.css'

export default class PublishCollectionModal extends React.PureComponent<Props> {
  componentWillMount() {
    const { collection, onClose } = this.props
    if (!collection) {
      onClose()
    }
  }

  handlePublish = () => {
    const { collection, items, onPublish } = this.props
    onPublish(collection!, items)
  }

  render() {
    const { onClose } = this.props
    return (
      <Modal name={name} className="PublishCollectionModal" size="tiny" onClose={onClose}>
        <ModalNavigation title={t('publish_collection_modal.title')} onClose={onClose} />
        <Modal.Content>
          {t('publish_collection_modal.first_paragraph')}
          <div className="divider"></div>
          {t('publish_collection_modal.second_paragraph')}
          <div className="divider"></div>
          {t('publish_collection_modal.third_paragraph')}
          <Button primary fluid onClick={this.handlePublish}>
            {t('publish_collection_modal.publish')}
          </Button>
        </Modal.Content>
      </Modal>
    )
  }
}
