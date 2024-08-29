import * as React from 'react'
import { ModalNavigation, Button, Loader } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getItemsToPublish, getItemsWithChanges } from 'modules/item/utils'
import { PublishButtonAction } from 'components/ThirdPartyCollectionDetailPage/CollectionPublishButton/CollectionPublishButton.types'
import { Props } from './PublishThirdPartyCollectionModal.types'
import styles from './PublishThirdPartyCollectionModal.module.css'
import classNames from 'classnames'

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

  getSubmittedItemsCount = () => {
    const { items, itemsStatus, itemCurations } = this.props
    return getItemsToPublish(items, itemsStatus).length + getItemsWithChanges(items, itemsStatus, itemCurations).length
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
      pushChangesProgress,
      metadata: { action }
    } = this.props

    const isPublishing =
      isPublishLoading && [PublishButtonAction.PUSH_CHANGES, PublishButtonAction.PUBLISH_AND_PUSH_CHANGES].includes(action)

    return (
      <Modal className="PublishThirdPartyCollectionModal" size="large" onClose={onClose}>
        <ModalNavigation title={''} onClose={onClose} />
        <Modal.Content>
          <div className={styles.content}>
            <div className={classNames(styles.loading, { [styles.visible]: isPublishing, [styles.hidden]: !isPublishing })}>
              <Loader active inline size="massive" />
              <div>%{pushChangesProgress}</div>
            </div>
            <h2>Submitting {this.getSubmittedItemsCount()} items for review</h2>
            <div>{this.getModalDescriptionText()}</div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button secondary disabled={isPublishLoading} onClick={onClose}>
            {t('global.cancel')}
          </Button>
          <Button primary loading={isPublishLoading} disabled={isPublishLoading} onClick={this.handleSubmit}>
            Proceed
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
