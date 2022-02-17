import React, { ReactNode, useMemo, useCallback } from 'react'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import { MAX_PUBLISH_ITEM_COUNT } from 'modules/thirdParty/utils'
import { getCollectionType } from 'modules/collection/utils'
import { CollectionType } from 'modules/collection/types'
import { SyncStatus } from 'modules/item/types'
import UnderReview from './UnderReview'
import { Props } from './CollectionPublishButton.types'

enum ButtonAction {
  PUBLISH,
  PUSH_CHANGES,
  PUBLISH_AND_PUSH_CHANGES
}

const CollectionPublishButton = (props: Props) => {
  const { collection, items, slots, onPublish, onPushChanges, itemsStatus } = props
  const isTP = getCollectionType(collection) === CollectionType.THIRD_PARTY

  const isPublishDisabled = useMemo(() => {
    return (
      !env.get('REACT_APP_FF_WEARABLES_PUBLISH') ||
      slots === 0 ||
      items.length === 0 ||
      (!isTP && items.length > MAX_PUBLISH_ITEM_COUNT) ||
      (!isTP && collection.isPublished)
    )
  }, [items, slots, collection])

  const buttonAction = useMemo(() => {
    let action = ButtonAction.PUBLISH
    const { willPublish, willPushChanges } = Object.values(itemsStatus).reduce(
      (acc, status) => {
        if (status === SyncStatus.UNPUBLISHED) {
          acc.willPublish = true
        } else if (status === SyncStatus.UNDER_REVIEW) {
          acc.willPushChanges = true
        }
        return acc
      },
      {
        willPublish: false,
        willPushChanges: false
      }
    )
    if (willPushChanges && !willPublish) {
      action = ButtonAction.PUSH_CHANGES
    } else if (willPushChanges && willPublish) {
      action = ButtonAction.PUBLISH_AND_PUSH_CHANGES
    }
    return action
  }, [itemsStatus])

  const TPCollectionButtonText = useMemo(() => {
    switch (buttonAction) {
      case ButtonAction.PUBLISH:
        return t('third_party_collection_detail_page.publish')
      case ButtonAction.PUSH_CHANGES:
        return t('third_party_collection_detail_page.push_changes')
      case ButtonAction.PUBLISH_AND_PUSH_CHANGES:
        return t('third_party_collection_detail_page.publish_and_push_changes')
    }
  }, [buttonAction])

  const handlePublish = useCallback(() => {
    const itemIds = items.map(item => item.id)
    switch (buttonAction) {
      case ButtonAction.PUBLISH:
        onPublish(collection.id, itemIds)
        return
      case ButtonAction.PUBLISH_AND_PUSH_CHANGES:
        onPublish(collection.id, itemIds, true)
        return
      case ButtonAction.PUSH_CHANGES:
        onPushChanges(collection.id, itemIds)
        return
    }
  }, [collection, items, buttonAction])

  const DCLCollectionButtonText = t('third_party_collection_detail_page.publish_items', { count: items.length })

  let button: ReactNode

  // TODO: @TPW Update this logic once Reviewing TPW is implemented. Use the selected items to render this button
  if (collection.isPublished) {
    if (collection.isApproved) {
      button = (
        <Button secondary compact disabled={true}>
          {t('global.published')}
        </Button>
      )
    } else {
      button = <UnderReview type="publish" />
    }
  } else {
    button = (
      <NetworkButton disabled={isPublishDisabled} primary compact onClick={handlePublish} network={Network.MATIC}>
        {isTP ? TPCollectionButtonText : DCLCollectionButtonText}
      </NetworkButton>
    )
  }

  return <>{button}</>
}

export default React.memo(CollectionPublishButton)
