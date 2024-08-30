import * as React from 'react'
import { ModalNavigation, Button, Icon, Loader } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getItemsToPublish, getItemsWithChanges } from 'modules/item/utils'
import { PublishThirdPartyCollectionModalStep } from 'modules/ui/thirdparty/types'
import { PublishButtonAction } from 'components/ThirdPartyCollectionDetailPage/CollectionPublishButton/CollectionPublishButton.types'
import { getTPButtonActionLabel } from 'components/ThirdPartyCollectionDetailPage/CollectionPublishButton/CollectionPublishButton'
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

  handleViewForumPost = () => {
    const { collection } = this.props
    if (collection) {
      window.open(collection.forumLink, '_blank', 'noopener noreferrer')
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
      pushChangesProgress,
      metadata: { action, step }
    } = this.props

    return (
      <Modal className="PublishThirdPartyCollectionModal" size="large" onClose={isPublishLoading ? undefined : onClose}>
        <ModalNavigation title={''} onClose={isPublishLoading ? undefined : onClose} />
        <Modal.Content>
          <div className={styles.content}>
            {step !== PublishThirdPartyCollectionModalStep.SUCCESS ? (
              <>
                <div className={classNames(styles.step, { [styles.visible]: isPublishLoading, [styles.hidden]: !isPublishLoading })}>
                  <Loader active inline size="massive" />
                  <div>% {pushChangesProgress}</div>
                </div>
                <h2>{t('publish_third_party_collection_modal.publishing_title', { count: this.getSubmittedItemsCount() })}</h2>
                <div className={styles.description}>{this.getModalDescriptionText()}</div>
              </>
            ) : (
              <>
                <div className={styles.step}>
                  <div className={styles.checkWrapper}>
                    <Icon name="check circle" size="huge" className={styles.check} />
                  </div>
                </div>
                <h2>{t('publish_third_party_collection_modal.success_title')}</h2>
                <div className={styles.description}>{t('publish_third_party_collection_modal.success_description')}</div>
              </>
            )}
          </div>
        </Modal.Content>
        <Modal.Actions>
          {step !== PublishThirdPartyCollectionModalStep.SUCCESS ? (
            <>
              <Button secondary disabled={isPublishLoading} onClick={onClose}>
                {t('global.cancel')}
              </Button>
              <Button primary disabled={isPublishLoading} onClick={this.handleSubmit}>
                {getTPButtonActionLabel(action)}
              </Button>
            </>
          ) : (
            <>
              <Button secondary disabled={isPublishLoading} onClick={this.handleViewForumPost}>
                {t('publish_third_party_collection_modal.view_forum')}
              </Button>
              <Button primary disabled={isPublishLoading} onClick={onClose}>
                {t('publish_third_party_collection_modal.finish')}
              </Button>
            </>
          )}
        </Modal.Actions>
      </Modal>
    )
  }
}
