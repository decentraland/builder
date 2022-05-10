import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getAuthorizedCollections } from 'modules/collection/selectors'
import { fetchCollectionsRequest } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionDropdown.types'
import ItemDropdown from './CollectionDropdown'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  collections: getAuthorizedCollections(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchCollections: (address, params) => dispatch(fetchCollectionsRequest(address, params))
})

export default connect(mapState, mapDispatch)(ItemDropdown)
