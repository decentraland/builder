import * as React from 'react'
import { ModalNavigation, Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAvailableSlots } from 'modules/thirdParty/utils'
import { Props } from './PublishThirdPartyCollectionModal.types'

export default class PublishThirdPartyCollectionModal extends React.PureComponent<Props> {
  handlePublish = () => {
    const { thirdParty, items, onPublish } = this.props
    onPublish(thirdParty!, items!)
  }

  render() {
    const { collection, items, thirdParty, isPublishLoading, onClose } = this.props

    return (
      <Modal className="PublishThirdPartyCollectionModal" size="tiny" onClose={onClose}>
        <ModalNavigation title={t('publish_third_party_collection_modal.title')} onClose={onClose} />
        <Modal.Content>
          <div>
            {t('publish_third_party_collection_modal.description', {
              slotsToUse: items.length,
              availableSlots: getAvailableSlots(thirdParty!).toNumber(),
              collectionName: collection!.name
            })}
          </div>
          <br />
          <Button primary fluid loading={isPublishLoading} onClick={this.handlePublish}>
            {t('global.publish')}
          </Button>
          <br />
          <Button secondary fluid onClick={onClose}>
            {t('global.cancel')}
          </Button>
        </Modal.Content>
      </Modal>
    )
  }
}
