import React, { ReactNode, useMemo, useState } from 'react'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import { AuthorizationType } from 'decentraland-dapps/dist/modules/authorization/types'
import { hasAuthorization } from 'decentraland-dapps/dist/modules/authorization/utils'
import { ContractName, getContract } from 'decentraland-transactions'
import { MAX_PUBLISH_ITEM_COUNT } from 'modules/thirdParty/utils'
import { AuthorizationModal } from 'components/AuthorizationModal'
import UnderReview from './UnderReview'
import { Props } from './CollectionPublishButton.types'

const CollectionPublishButton = (props: Props) => {
  const { wallet, collection, items, slots, authorizations, onPublish } = props
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const isPublishDisabled = useMemo(() => {
    return !env.get('REACT_APP_FF_WEARABLES_PUBLISH') || slots === 0 || items.length === 0 || items.length > MAX_PUBLISH_ITEM_COUNT
  }, [items])

  // TODO: Is this necessary??
  const getAuthorization = () => {
    const chainId = wallet.networks.MATIC.chainId
    const contractAddress = getContract(ContractName.MANAToken, chainId).address
    const authorizedAddress = getContract(ContractName.CollectionManager, chainId).address

    return {
      type: AuthorizationType.ALLOWANCE,
      address: wallet.address,
      contractName: ContractName.MANAToken,
      contractAddress,
      authorizedAddress,
      chainId
    }
  }

  const handlePublish = () => {
    const hasAuth = hasAuthorization(authorizations, getAuthorization())
    if (hasAuth) {
      onPublish()
    }
    setIsAuthModalOpen(!hasAuth)
  }

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false)
  }

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
