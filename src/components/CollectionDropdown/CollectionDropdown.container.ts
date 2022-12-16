import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getAuthorizedCollections } from 'modules/collection/selectors'
import { fetchCollectionsRequest, FETCH_COLLECTIONS_REQUEST } from 'modules/collection/actions'
import { getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionDropdown.types'
import ItemDropdown from './CollectionDropdown'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  collections: getAuthorizedCollections(state),
  isLoading: isLoadingType(getLoadingCollection(state), FETCH_COLLECTIONS_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchCollections: (address, params) => dispatch(fetchCollectionsRequest(address, params, true))
})

export default connect(mapState, mapDispatch)(ItemDropdown)
