import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { isLoggingIn } from 'modules/identity/selectors'
import { getLoading, getCollection, getCollectionItems } from 'modules/collection/selectors'
import { FETCH_COLLECTION_REQUEST, fetchCollectionRequest } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionProvider.types'
import CollectionProvider from './CollectionProvider'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const id = ownProps.id || getCollectionId(state)
  const collection = id ? getCollection(state, id) : null
  const items = collection ? getCollectionItems(state, collection.id) : []
  return {
    id,
    collection,
    items,
    isLoading: isLoadingType(getLoading(state), FETCH_COLLECTION_REQUEST) || isLoggingIn(state) || isConnecting(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchCollection: id => dispatch(fetchCollectionRequest(id))
})

export default connect(mapState, mapDispatch)(CollectionProvider)
