import React, { ReactNode, useEffect, useState } from 'react'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import { hasAuthorization } from 'decentraland-dapps/dist/modules/authorization/utils'
import { ContractName } from 'decentraland-transactions'
import { AuthorizationModal } from 'components/AuthorizationModal'
import { isComplete } from 'modules/item/utils'
import { SyncStatus } from 'modules/item/types'
import { Props } from './CollectionPublishButton.types'
import UnderReview from './UnderReview'
import { buildManaAuthorization } from 'lib/mana'

const CollectionPublishButton = (props: Props) => {
  const { wallet, collection, items, authorizations, status, hasPendingCuration, onPublish, onPush, onInit } = props
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    onInit()
  }, [])

  const isPublishDisabled = () => {
    return !env.get('REACT_APP_FF_WEARABLES_PUBLISH') || items.length === 0 || !items.every(isComplete)
  }

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
    button = (
      <NetworkButton disabled={isPublishDisabled()} primary compact onClick={handlePublish} network={Network.MATIC}>
        {t('global.publish')}
      </NetworkButton>
    )
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
