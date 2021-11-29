import React, { ReactNode, useMemo, useState, useCallback } from 'react'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import { MAX_PUBLISH_ITEM_COUNT } from 'modules/thirdParty/utils'
import { AuthorizationModal } from 'components/AuthorizationModal'
import UnderReview from './UnderReview'
import { Props } from './CollectionPublishButton.types'

const CollectionPublishButton = (props: Props) => {
  const { collection, items, slots, onPublish } = props

  const isPublishDisabled = useMemo(() => {
    return !env.get('REACT_APP_FF_WEARABLES_PUBLISH') || slots === 0 || items.length === 0 || items.length > MAX_PUBLISH_ITEM_COUNT
  }, [items])

  const handlePublish = useCallback(() => {
    onPublish()
  }, [])

  let button: ReactNode

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
