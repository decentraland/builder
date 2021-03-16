import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollections, getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { getLoading as getLoadingItem } from 'modules/item/selectors'
import { isWalletCommitteeMember } from 'modules/committee/selectors'
import { fetchCollectionsRequest, FETCH_COLLECTIONS_REQUEST } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CurationPage.types'
import CurationPage from './CurationPage'
import { fetchItemsRequest, FETCH_ITEMS_REQUEST } from 'modules/item/actions'

const mapState = (state: RootState): MapStateProps => ({
  wallet: getWallet(state)!,
  collections: getCollections(state).filter(collection => collection.isPublished),
  isCommitteeMember: isWalletCommitteeMember(state),
  isConnecting: isConnecting(state),
  isLoading:
    isLoadingType(getLoadingCollection(state), FETCH_COLLECTIONS_REQUEST) || isLoadingType(getLoadingItem(state), FETCH_ITEMS_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchCollections: () => dispatch(fetchCollectionsRequest()),
  onFetchItems: () => dispatch(fetchItemsRequest())
})

export default connect(mapState, mapDispatch)(CurationPage)
