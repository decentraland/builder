import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getAddress, getChainId, getLoading, isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { isWalletCommitteeMember } from 'modules/committee/selectors'
import { getSelectedCollectionId, isReviewing } from 'modules/location/selectors'
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
import { MapStateProps, MapDispatchProps, MapDispatch } from './TopPanel.types'
import TopPanel from './TopPanel'

const mapState = (state: RootState): MapStateProps => {
  const selectedCollectionId = getSelectedCollectionId(state)
  const collection = selectedCollectionId ? getCollection(state, selectedCollectionId) : null
  const items = collection ? getCollectionItems(state, collection.id) : []
  const itemCurations = collection ? getItemCurations(state, collection.id) : []
  const curation = selectedCollectionId ? getCuration(state, selectedCollectionId) : null
  const itemsPaginationData = selectedCollectionId ? getPaginationData(state, selectedCollectionId) : undefined
  const thirdParty = collection && isTPCollection(collection) ? getCollectionThirdParty(state, collection) : null

  // Default to false if no collection is selected
  const hasMissingEntities = selectedCollectionId ? hasCollectionMissingEntities(state, selectedCollectionId) : false

  return {
    address: getAddress(state),
    items,
    totalItems: itemsPaginationData?.total || null,
    collection,
    itemCurations,
    thirdParty,
    curation,
    chainId: getChainId(state),
    isConnected: isConnected(state),
    isReviewing: isReviewing(state),
    isCommitteeMember: isWalletCommitteeMember(state),
    selectedCollectionId,
    hasCollectionMissingEntities: hasMissingEntities,
    isLoading:
      isLoadingType(getLoading(state), FETCH_COLLECTION_REQUEST) ||
      isLoadingType(getLoadingItemCurations(state), FETCH_ITEM_CURATIONS_REQUEST) ||
      isLoadingType(getLoadingItems(state), FETCH_COLLECTION_ITEMS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onSetAssignee: (collectionId, assignee, curation) => dispatch(setCollectionCurationAssigneeRequest(collectionId, assignee, curation)),
  onInitiateTPApprovalFlow: collection => dispatch(initiateTPApprovalFlow(collection)),
  onInitiateApprovalFlow: collection => dispatch(initiateApprovalFlow(collection)),
  onDeployMissingEntities: collection => dispatch(deployMissingEntitiesRequest(collection))
})

export default connect(mapState, mapDispatch)(TopPanel)
