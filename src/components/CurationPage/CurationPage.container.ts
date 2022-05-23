import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getPaginatedCollections, getLoading as getLoadingCollection, getPaginationData } from 'modules/collection/selectors'
import { getCurationsByCollectionId, getLoading as getLoadingCuration } from 'modules/curations/collectionCuration/selectors'
import { getLoading as getLoadingCommittee, getCommitteeMembers, isWalletCommitteeMember } from 'modules/committee/selectors'
import { FETCH_COMMITTEE_MEMBERS_REQUEST } from 'modules/committee/action'
import { fetchCollectionsRequest, FETCH_COLLECTIONS_REQUEST } from 'modules/collection/actions'
import { FETCH_COLLECTION_CURATION_REQUEST } from 'modules/curations/collectionCuration/actions'
import { MapDispatch, MapDispatchProps, MapStateProps } from './CurationPage.types'
import CurationPage from './CurationPage'

const mapState = (state: RootState): MapStateProps => {
  const curationsByCollectionId = getCurationsByCollectionId(state)
  const paginatedCollections = getPaginatedCollections(state)
  const paginationData = getPaginationData(state)

  return {
    wallet: getWallet(state)!,
    collections: paginatedCollections,
    paginationData,
    curationsByCollectionId,
    isCommitteeMember: isWalletCommitteeMember(state),
    committeeMembers: getCommitteeMembers(state),
    isConnecting: isConnecting(state),
    isLoadingCommittee: isLoadingType(getLoadingCommittee(state), FETCH_COMMITTEE_MEMBERS_REQUEST),
    isLoadingCollectionsData:
      isLoadingType(getLoadingCollection(state), FETCH_COLLECTIONS_REQUEST) ||
      isLoadingType(getLoadingCuration(state), FETCH_COLLECTION_CURATION_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchCollections: params => dispatch(fetchCollectionsRequest(undefined, params))
})

export default connect(mapState, mapDispatch)(CurationPage)
