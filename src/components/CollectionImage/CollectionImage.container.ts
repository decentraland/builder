import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionItems, getLoading as getLoadingItem } from 'modules/item/selectors'
import { getCollection } from 'modules/collection/selectors'
import { fetchCollectionItemsRequest, FETCH_COLLECTION_ITEMS_REQUEST, FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { OwnProps, MapStateProps, MapDispatch, MapDispatchProps } from './CollectionImage.types'
import CollectionImage from './CollectionImage'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collectionId } = ownProps
  const itemCount = getCollection(state, collectionId)?.itemCount
  const items = getCollectionItems(state, collectionId)
  const isLoading = !!getLoadingItem(state).find(
    action => action.type === FETCH_COLLECTION_ITEMS_REQUEST && action.payload.collectionId === collectionId
  )
  return {
    items,
    itemCount,
    isLoading: isLoadingType(getLoadingItem(state), FETCH_ITEMS_REQUEST) || isLoading
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchCollectionItems: (id, options) => dispatch(fetchCollectionItemsRequest(id, { page: options?.page, limit: options?.limit }))
})

export default connect(mapState, mapDispatch)(CollectionImage)
