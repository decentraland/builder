import React, { useEffect, useMemo } from 'react'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Popup } from 'decentraland-ui'
import { MAX_ITEMS } from 'modules/collection/constants'
import { isComplete } from 'modules/item/utils'
import { SyncStatus } from 'modules/item/types'
import { Props } from './CollectionPublishButton.types'
import UnderReview from './UnderReview'

const CollectionPublishButton = (props: Props) => {
  const { collection, items, status, hasPendingCuration, onPublish, onPush, onInit } = props

  useEffect(() => {
    if (collection.isPublished) {
      onInit()
    }
  }, [collection, onInit])

  const hasExceededMaxItemsLimit = items.length > MAX_ITEMS

  const isPublishDisabled = useMemo(
    () => items.length === 0 || !items.every(isComplete) || hasExceededMaxItemsLimit,
    [items, hasExceededMaxItemsLimit]
  )

  let button: JSX.Element

  if (collection.isPublished) {
    if (collection.isApproved) {
      if (hasPendingCuration) {
        button = <UnderReview type="push" />
      } else if (status === SyncStatus.UNSYNCED) {
        button = (
          <Button primary compact onClick={onPush}>
            {t('collection_detail_page.push_changes')}
          </Button>
        )
      } else {
        button = (
          <Button secondary compact disabled={true}>
            {t('global.published')}
          </Button>
        )
      }
    } else {
      button = <UnderReview type="publish" />
    }
  } else {
    const publishButton = (
      <NetworkButton disabled={isPublishDisabled} primary compact onClick={onPublish} network={Network.MATIC}>
        {t('collection_detail_page.publish')}
      </NetworkButton>
    )

    if (isPublishDisabled) {
      let reason: string

      if (items.length > MAX_ITEMS) {
        reason = t('collection_detail_page.publish_reason_max_items', {
          maxItems: MAX_ITEMS
        })
      } else if (items.length === 0) {
        reason = t('collection_detail_page.publish_reason_no_items')
      } else {
        reason = t('collection_detail_page.publish_reason_items_not_complete')
      }

      button = (
        <Popup
          content={reason}
          position="top center"
          trigger={<div className="popup-button">{publishButton}</div>}
          hideOnScroll={true}
          on="hover"
          inverted
          flowing={true}
        />
      )
    } else {
      button = publishButton
    }
  }

  return button
}

export default React.memo(CollectionPublishButton)
