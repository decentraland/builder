import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Popup } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import { hasAuthorization } from 'decentraland-dapps/dist/modules/authorization/utils'
import { ContractName } from 'decentraland-transactions'
import { AuthorizationModal } from 'components/AuthorizationModal'
import { MAX_ITEMS } from 'modules/collection/constants'
import { isComplete } from 'modules/item/utils'
import { SyncStatus } from 'modules/item/types'
import { buildManaAuthorization } from 'lib/mana'
import { Props } from './CollectionPublishButton.types'
import UnderReview from './UnderReview'

const CollectionPublishButton = (props: Props) => {
  const { wallet, collection, items, authorizations, status, hasPendingCuration, onPublish, onPush, onInit } = props
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    onInit()
  }, [])

  const hasExceededMaxItemsLimit = items.length > MAX_ITEMS
  const isPublishDisabled = useMemo(
    () => !env.get('REACT_APP_FF_WEARABLES_PUBLISH') || items.length === 0 || !items.every(isComplete) || hasExceededMaxItemsLimit,
    [items, hasExceededMaxItemsLimit]
  )

  const getAuthorization = (): Authorization => {
    return buildManaAuthorization(wallet.address, wallet.networks.MATIC.chainId, ContractName.CollectionManager)
  }

  const handlePublish = () => {
    const hasAuth = hasAuthorization(authorizations, getAuthorization())
    if (hasAuth) onPublish()
    setIsAuthModalOpen(!hasAuth)
  }

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false)
  }

  let button: ReactNode

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
      <NetworkButton disabled={isPublishDisabled} primary compact onClick={handlePublish} network={Network.MATIC}>
        {t('global.publish')}
      </NetworkButton>
    )

    if (isPublishDisabled) {
      let reason: string

      if (items.length > MAX_ITEMS) {
        reason = t('collection_detail_page.publish_reason_max_items', { maxItems: MAX_ITEMS })
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

  return (
    <>
      {button}
      <AuthorizationModal
        open={isAuthModalOpen}
        authorization={getAuthorization()}
        onProceed={handlePublish}
        onCancel={handleAuthModalClose}
      />
    </>
  )
}

export default React.memo(CollectionPublishButton)
