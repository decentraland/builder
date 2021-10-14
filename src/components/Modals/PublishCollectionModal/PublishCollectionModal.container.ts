import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollection, getLoading as getCollectionLoading } from 'modules/collection/selectors'
import { getLoading as getItemLoading, getCollectionItems } from 'modules/item/selectors'
import { publishCollectionRequest, PUBLISH_COLLECTION_REQUEST } from 'modules/collection/actions'
import { fetchRaritiesRequest, FETCH_RARITIES_REQUEST, FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { getRarities } from 'modules/item/selectors'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './PublishCollectionModal.types'
import PublishCollectionModal from './PublishCollectionModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collectionId } = ownProps.metadata

  return {
    wallet: getWallet(state),
    collection: getCollection(state, collectionId),
    items: getCollectionItems(state, collectionId),
    rarities: getRarities(state),
    isPublishLoading: isLoadingType(getCollectionLoading(state), PUBLISH_COLLECTION_REQUEST),
    isFetchingItems: isLoadingType(getItemLoading(state), FETCH_ITEMS_REQUEST),
    isFetchingRarities: isLoadingType(getItemLoading(state), FETCH_RARITIES_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (collection, items, email) => dispatch(publishCollectionRequest(collection, items, email)),
  onFetchRarities: () => dispatch(fetchRaritiesRequest())
})

export default connect(mapState, mapDispatch)(PublishCollectionModal)
