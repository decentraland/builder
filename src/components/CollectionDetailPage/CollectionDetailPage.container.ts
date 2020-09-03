import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { getCollections, getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { getItems, getLoading as getLoadingItem } from 'modules/item/selectors'
import { FETCH_COLLECTIONS_REQUEST } from 'modules/collection/actions'
import { FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './CollectionDetailPage.types'
import CollectionDetailPage from './CollectionDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const collectionId = getCollectionId(state) || ''
  const collections = getCollections(state)
  const allItems = getItems(state)

  const collection = collections.find(collection => collection.id === collectionId) || null
  const items = collection ? allItems.filter(item => item.collectionId === collectionId) : []

  return {
    collection,
    items,
    isLoading:
      isLoadingType(getLoadingCollection(state), FETCH_ITEMS_REQUEST) || isLoadingType(getLoadingItem(state), FETCH_COLLECTIONS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(CollectionDetailPage)
