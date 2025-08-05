import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { getAddress, getChainId, getLoading, isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { isWalletCommitteeMember } from 'modules/committee/selectors'
import { useGetSelectedCollectionIdFromCurrentUrl, useGetIsReviewingFromCurrentUrl } from 'modules/location/hooks'
import { setCollectionCurationAssigneeRequest } from 'modules/curations/collectionCuration/actions'
import {
  FETCH_COLLECTION_REQUEST,
  initiateApprovalFlow,
  initiateTPApprovalFlow,
  deployMissingEntitiesRequest
} from 'modules/collection/actions'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getCollection, hasCollectionMissingEntities } from 'modules/collection/selectors'
import { FETCH_ITEM_CURATIONS_REQUEST } from 'modules/curations/itemCuration/actions'
import { FETCH_COLLECTION_ITEMS_REQUEST } from 'modules/item/actions'
import { getCollectionItems, getLoading as getLoadingItems, getPaginationData } from 'modules/item/selectors'
import { getCuration } from 'modules/curations/collectionCuration/selectors'
import { getItemCurations, getLoading as getLoadingItemCurations } from 'modules/curations/itemCuration/selectors'
import { getCollectionThirdParty } from 'modules/thirdParty/selectors'
import { isTPCollection } from 'modules/collection/utils'
import { ContainerProps } from './TopPanel.types'
import TopPanel from './TopPanel'

const TopPanelContainer: React.FC<ContainerProps> = ({ reviewedItems }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const selectedCollectionId = useGetSelectedCollectionIdFromCurrentUrl()
  const isReviewing = useGetIsReviewingFromCurrentUrl()

  const address = useSelector(getAddress)
  const chainId = useSelector(getChainId)
  const isWalletConnected = useSelector(isConnected)
  const isCommitteeMember = useSelector(isWalletCommitteeMember)

  const collection = useSelector((state: RootState) => (selectedCollectionId ? getCollection(state, selectedCollectionId) : null))
  const items = useSelector((state: RootState) => (collection ? getCollectionItems(state, collection.id) : []))
  const itemCurations = useSelector((state: RootState) => (collection ? getItemCurations(state, collection.id) : []))
  const curation = useSelector((state: RootState) => (selectedCollectionId ? getCuration(state, selectedCollectionId) : null))
  const itemsPaginationData = useSelector((state: RootState) =>
    selectedCollectionId ? getPaginationData(state, selectedCollectionId) : undefined
  )
  const thirdParty = useSelector((state: RootState) =>
    collection && isTPCollection(collection) ? getCollectionThirdParty(state, collection) : null
  )
  const hasMissingEntities = useSelector((state: RootState) =>
    selectedCollectionId ? hasCollectionMissingEntities(state, selectedCollectionId) : false
  )
  const isLoading = useSelector(
    (state: RootState) =>
      isLoadingType(getLoading(state), FETCH_COLLECTION_REQUEST) ||
      isLoadingType(getLoadingItemCurations(state), FETCH_ITEM_CURATIONS_REQUEST) ||
      isLoadingType(getLoadingItems(state), FETCH_COLLECTION_ITEMS_REQUEST)
  )

  const handleSetAssignee: ActionFunction<typeof setCollectionCurationAssigneeRequest> = useCallback(
    (collectionId, assignee, curation) => {
      dispatch(setCollectionCurationAssigneeRequest(collectionId, assignee, curation))
    },
    [dispatch]
  )
  const handleInitiateTPApprovalFlow: ActionFunction<typeof initiateTPApprovalFlow> = useCallback(
    collection => {
      dispatch(initiateTPApprovalFlow(collection))
    },
    [dispatch]
  )
  const handleInitiateApprovalFlow: ActionFunction<typeof initiateApprovalFlow> = useCallback(
    collection => {
      dispatch(initiateApprovalFlow(collection))
    },
    [dispatch]
  )
  const handleDeployMissingEntities: ActionFunction<typeof deployMissingEntitiesRequest> = useCallback(
    collection => {
      dispatch(deployMissingEntitiesRequest(collection))
    },
    [dispatch]
  )

  return (
    <TopPanel
      address={address}
      items={items}
      totalItems={itemsPaginationData?.total || null}
      collection={collection}
      itemCurations={itemCurations}
      thirdParty={thirdParty}
      curation={curation}
      chainId={chainId}
      isConnected={isWalletConnected}
      isReviewing={isReviewing}
      isCommitteeMember={isCommitteeMember}
      selectedCollectionId={selectedCollectionId}
      hasCollectionMissingEntities={hasMissingEntities}
      isLoading={isLoading}
      reviewedItems={reviewedItems}
      onSetAssignee={handleSetAssignee}
      onInitiateTPApprovalFlow={handleInitiateTPApprovalFlow}
      onInitiateApprovalFlow={handleInitiateApprovalFlow}
      onDeployMissingEntities={handleDeployMissingEntities}
      history={history}
    />
  )
}

export default TopPanelContainer
