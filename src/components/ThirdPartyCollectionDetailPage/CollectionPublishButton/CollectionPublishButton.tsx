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
import { Props, PublishButtonAction } from './CollectionPublishButton.types'

export const getTPButtonActionLabel = (buttonAction: PublishButtonAction) => {
  let label
  switch (buttonAction) {
    case PublishButtonAction.PUSH_CHANGES:
      label = t('third_party_collection_detail_page.push_changes')
    case PublishButtonAction.PUBLISH_AND_PUSH_CHANGES:
      label = t('third_party_collection_detail_page.publish_and_push_changes')
    default:
      label = t('third_party_collection_detail_page.publish')
  }
  return label
}

const CollectionPublishButton = (props: Props) => {
  const { collection, items, slots, onClick, itemsStatus } = props
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
    let action = PublishButtonAction.PUBLISH
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
      action = PublishButtonAction.PUSH_CHANGES
    } else if (willPushChanges && willPublish) {
      action = PublishButtonAction.PUBLISH_AND_PUSH_CHANGES
    }
    return action
  }, [itemsStatus])

  const handlePublish = useCallback(() => {
    const itemIds = items.map(item => item.id)
    onClick(collection.id, itemIds, buttonAction)
  }, [collection, items, buttonAction])

  const DCLCollectionButtonText = t('third_party_collection_detail_page.publish_items', { count: items.length })

  let button: ReactNode

  // TODO: @TPW Update this logic once Reviewing TPW is implemented. Use the selected items to render this button
  if (!isTP && collection.isPublished) {
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
        {isTP ? getTPButtonActionLabel(buttonAction) : DCLCollectionButtonText}
      </NetworkButton>
    )
  }

  return <>{button}</>
}

export default React.memo(CollectionPublishButton)
