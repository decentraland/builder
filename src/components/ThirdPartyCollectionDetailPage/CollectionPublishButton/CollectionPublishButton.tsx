import React, { ReactNode, useMemo, useCallback } from 'react'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import { MAX_PUBLISH_ITEM_COUNT } from 'modules/thirdParty/utils'
import UnderReview from './UnderReview'
import { Props } from './CollectionPublishButton.types'

const CollectionPublishButton = (props: Props) => {
  const { collection, items, slots, onPublish } = props

  const isPublishDisabled = useMemo(() => {
    return (
      !env.get('REACT_APP_FF_WEARABLES_PUBLISH') ||
      slots === 0 ||
      items.length === 0 ||
      items.length > MAX_PUBLISH_ITEM_COUNT ||
      collection.isPublished
    )
  }, [items])

  const handlePublish = useCallback(() => {
    const itemIds = items.map(item => item.id)
    onPublish(collection.id, itemIds)
  }, [collection, items])

  let button: ReactNode

  // TODO: Update this logic once Reviewing TPW is implemented
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
        {t('third_party_collection_detail_page.publish_items', { count: items.length })}
      </NetworkButton>
    )
  }

  return <>{button}</>
}

export default React.memo(CollectionPublishButton)
