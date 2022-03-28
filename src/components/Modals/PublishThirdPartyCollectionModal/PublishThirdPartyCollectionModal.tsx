import * as React from 'react'
import { ModalNavigation, Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getItemsToPublish, getItemsWithChanges } from 'modules/item/utils'
import { PublishButtonAction } from 'components/ThirdPartyCollectionDetailPage/CollectionPublishButton/CollectionPublishButton.types'
import { getTPButtonActionLabel } from 'components/ThirdPartyCollectionDetailPage/CollectionPublishButton/CollectionPublishButton'
import { Props } from './PublishThirdPartyCollectionModal.types'

export default class PublishThirdPartyCollectionModal extends React.PureComponent<Props> {
  handleSubmit = () => {
    const {
      items,
      itemsStatus,
      itemCurations,
      thirdParty,
      onPublish,
      onPushChanges,
      onPublishAndPushChanges,
      metadata: { action }
    } = this.props

    if (!thirdParty) return

    switch (action) {
      case PublishButtonAction.PUSH_CHANGES:
        onPushChanges(items)
        break
      case PublishButtonAction.PUBLISH_AND_PUSH_CHANGES:
        onPublishAndPushChanges(thirdParty, getItemsToPublish(items, itemsStatus), getItemsWithChanges(items, itemsStatus, itemCurations))
        break
      default:
        onPublish(thirdParty, items)
        break
    }
  }

  getModalDescriptionText = () => {
    const { items, itemsStatus, itemCurations, thirdParty, collection } = this.props

    const itemsToPublishLength = getItemsToPublish(items, itemsStatus).length
    const itemsToPushChangesLength = getItemsWithChanges(items, itemsStatus, itemCurations).length

    const isPublishingAndPushingChanges = itemsToPushChangesLength > 0 && itemsToPublishLength > 0
    const isJustPushingChanges = itemsToPushChangesLength > 0 && !itemsToPublishLength

    if (isPublishingAndPushingChanges) {
      return t('publish_third_party_collection_modal.publish_and_push_changes_description', {
        slotsToUse: itemsToPublishLength,
        itemsWithChanges: itemsToPushChangesLength,
        availableSlots: thirdParty?.availableSlots,
        collectionName: collection!.name
      })
    } else if (isJustPushingChanges) {
      return t('publish_third_party_collection_modal.push_changes_description', {
        itemsWithChanges: itemsToPushChangesLength,
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
