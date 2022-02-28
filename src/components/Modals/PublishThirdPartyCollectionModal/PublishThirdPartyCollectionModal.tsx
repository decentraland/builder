import * as React from 'react'
import { ModalNavigation, Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { SyncStatus } from 'modules/item/types'
import { PublishButtonAction } from 'components/ThirdPartyCollectionDetailPage/CollectionPublishButton/CollectionPublishButton.types'
import { getTPButtonActionLabel } from 'components/ThirdPartyCollectionDetailPage/CollectionPublishButton/CollectionPublishButton'
import { Props } from './PublishThirdPartyCollectionModal.types'

export default class PublishThirdPartyCollectionModal extends React.PureComponent<Props> {
  handleSubmit = () => {
    const {
      items,
      thirdParty,
      onPublish,
      onPushChanges,
      onPublishAndPushChanges,
      metadata: { action }
    } = this.props

    let fn
    switch (action) {
      case PublishButtonAction.PUSH_CHANGES:
        fn = onPushChanges
      case PublishButtonAction.PUBLISH_AND_PUSH_CHANGES:
        fn = onPublishAndPushChanges
      default:
        fn = onPublish
    }

    fn(thirdParty!, items!)
  }

  getModalDescriptionText = () => {
    const { items, thirdParty, collection, itemsStatus } = this.props

    const itemsToPublish = Object.values(itemsStatus).filter(status => status === SyncStatus.UNPUBLISHED).length
    const itemsToPushChanges = Object.values(itemsStatus).filter(status => status === SyncStatus.UNDER_REVIEW).length

    const isPublishingAndPushingChanges = itemsToPushChanges > 0 && itemsToPublish > 0
    const isJustPushingChanges = itemsToPushChanges > 0 && !itemsToPublish

    if (isPublishingAndPushingChanges) {
      return t('publish_third_party_collection_modal.publish_and_push_changes_description', {
        slotsToUse: itemsToPublish,
        itemsWithChanges: itemsToPushChanges,
        availableSlots: thirdParty?.availableSlots,
        collectionName: collection!.name
      })
    } else if (isJustPushingChanges) {
      return t('publish_third_party_collection_modal.push_changes_description', {
        itemsWithChanges: itemsToPushChanges,
        collectionName: collection!.name
      })
    }

    return t('publish_third_party_collection_modal.publish_description', {
      slotsToUse: items.length,
      availableSlots: thirdParty?.availableSlots,
      collectionName: collection!.name
    })
  }

  render() {
    const {
      isPublishLoading,
      onClose,
      metadata: { action }
    } = this.props

    return (
      <Modal className="PublishThirdPartyCollectionModal" size="tiny" onClose={onClose}>
        <ModalNavigation title={t('publish_third_party_collection_modal.title')} onClose={onClose} />
        <Modal.Content>
          <div>{this.getModalDescriptionText()}</div>
          <br />
          <Button primary fluid loading={isPublishLoading} onClick={this.handleSubmit}>
            {getTPButtonActionLabel(action)}
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
