import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { isLoggingIn } from 'modules/identity/selectors'
import { getCollectionItems } from 'modules/item/selectors'
import { getLoading, getCollection } from 'modules/collection/selectors'
import { FETCH_COLLECTION_REQUEST, fetchCollectionRequest } from 'modules/collection/actions'
import { getItemCurations, getLoading as getLoadingItemCurations } from 'modules/curations/itemCuration/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionProvider.types'
import CollectionProvider from './CollectionProvider'
import { getCuration } from 'modules/curations/collectionCuration/selectors'
import { FETCH_ITEM_CURATIONS_REQUEST } from 'modules/curations/itemCuration/actions'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const id = ownProps.id || getCollectionId(state)
  const collection = id ? getCollection(state, id) : null
  const items = collection ? getCollectionItems(state, collection.id) : []
  const itemCurations = collection ? getItemCurations(state, collection.id) : []
  const curation = id ? getCuration(state, id) : null
  return {
    id,
    collection,
    items,
    itemCurations,
    curation,
    isConnecting: isLoggingIn(state) || isConnecting(state),
    isLoading:
      isLoadingType(getLoading(state), FETCH_COLLECTION_REQUEST) ||
      isLoadingType(getLoadingItemCurations(state), FETCH_ITEM_CURATIONS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchCollection: id => dispatch(fetchCollectionRequest(id))
})

export default connect(mapState, mapDispatch)(CollectionProvider)
