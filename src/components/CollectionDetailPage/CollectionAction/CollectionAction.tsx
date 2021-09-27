import React, { ReactNode, useEffect, useState } from 'react'
import { Network } from '@dcl/schemas'
import { ChainButton } from 'decentraland-dapps/dist/containers'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Popup } from 'decentraland-ui'
import { env } from 'decentraland-commons'
import { AuthorizationType } from 'decentraland-dapps/dist/modules/authorization/types'
import { hasAuthorization } from 'decentraland-dapps/dist/modules/authorization/utils'
import { ContractName, getContract } from 'decentraland-transactions'
import { AuthorizationModal } from 'components/AuthorizationModal'
import { SyncStatus } from 'modules/item/types'
import { isComplete } from 'modules/item/utils'
import { Props } from './CollectionAction.types'

const CollectionAction = ({ wallet, collection, items, authorizations, status, isAwaitingCuration, onPublish, onPush, onInit }: Props) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    onInit()
  }, [])

  const isPublishDisabled = () => {
    return !env.get('REACT_APP_FF_WEARABLES_PUBLISH') || items.length === 0 || !items.every(isComplete)
  }

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
    if (hasAuth) onPublish()
    setIsAuthModalOpen(!hasAuth)
  }

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false)
  }

  let button: ReactNode

  if (collection.isPublished) {
    if (collection.isApproved) {
      if (status === SyncStatus.UNSYNCED) {
        if (isAwaitingCuration) {
          button = <UnderReview type="push" />
        } else {
          button = (
            <Button primary compact onClick={onPush}>
              Push Changes
            </Button>
          )
        }
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
      <ChainButton disabled={isPublishDisabled()} primary compact onClick={handlePublish} chainId={getChainIdByNetwork(Network.MATIC)}>
        {t('collection_detail_page.publish')}
      </ChainButton>
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

type UnderReviewProps = {
  type: 'publish' | 'push'
}

const UnderReview = ({ type }: UnderReviewProps) => (
  <Popup
    content={t(type === 'publish' ? 'collection_detail_page.cant_mint' : 'collection_detail_page.cant_push')}
    position="top center"
    trigger={
      <div className="popup-button">
        <Button secondary compact disabled={true}>
          {t('collection_detail_page.under_review')}
        </Button>
      </div>
    }
    hideOnScroll={true}
    on="hover"
    inverted
    flowing
  />
)

export default React.memo(CollectionAction)
