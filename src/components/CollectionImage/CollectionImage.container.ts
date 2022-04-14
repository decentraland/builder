import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionItems, getLoading as getLoadingItem } from 'modules/item/selectors'
import { getCollection, getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { FETCH_COLLECTIONS_REQUEST } from 'modules/collection/actions'
import { fetchCollectionItemsRequest, FETCH_COLLECTION_ITEMS_REQUEST, FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { OwnProps, MapStateProps, MapDispatch, MapDispatchProps } from './CollectionImage.types'
import CollectionImage from './CollectionImage'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collectionId } = ownProps
  const itemCount = getCollection(state, collectionId)?.itemCount
  const items = getCollectionItems(state, collectionId)
  return {
    items,
    itemCount,
    isLoading:
      isLoadingType(getLoadingCollection(state), FETCH_COLLECTIONS_REQUEST) ||
      isLoadingType(getLoadingItem(state), FETCH_ITEMS_REQUEST) ||
      isLoadingType(getLoadingItem(state), FETCH_COLLECTION_ITEMS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchCollectionItems: (id, page, limit) => dispatch(fetchCollectionItemsRequest(id, page, limit))
})

export default connect(mapState, mapDispatch)(CollectionImage)
