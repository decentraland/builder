import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getItemId } from 'modules/location/selectors'
import { isLoggingIn } from 'modules/identity/selectors'
import { getLoading, getItems } from 'modules/item/selectors'
import { getCollections } from 'modules/collection/selectors'
import { FETCH_ITEM_REQUEST, fetchItemRequest, SAVE_ITEM_REQUEST } from 'modules/item/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './ItemProvider.types'
import ItemProvider from './ItemProvider'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const id = ownProps.id || getItemId(state)
  const items = getItems(state)
  const collections = getCollections(state)

  const item = items.find(item => item.id === id) || null

  let collection = null
  if (item && item.collectionId) {
    collection = collections.find(collection => collection.id === item.collectionId) || null
  }

  return {
    id,
    item,
    collection,
    isLoading:
      isLoadingType(getLoading(state), FETCH_ITEM_REQUEST) ||
      isLoadingType(getLoading(state), SAVE_ITEM_REQUEST) ||
      isLoggingIn(state) ||
      isConnecting(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchItem: id => dispatch(fetchItemRequest(id))
})

export default connect(mapState, mapDispatch)(ItemProvider)
