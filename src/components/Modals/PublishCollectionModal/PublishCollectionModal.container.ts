import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollection, getCollectionItems, getLoading } from 'modules/collection/selectors'
import { publishCollectionRequest, PUBLISH_COLLECTION_REQUEST } from 'modules/collection/actions'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './PublishCollectionModal.types'
import PublishCollectionModal from './PublishCollectionModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collectionId } = ownProps.metadata

  return {
    wallet: getWallet(state),
    collection: getCollection(state, collectionId),
    items: getCollectionItems(state, collectionId),
    isLoading: isLoadingType(getLoading(state), PUBLISH_COLLECTION_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (collection, items, email) => dispatch(publishCollectionRequest(collection, items, email))
})

export default connect(mapState, mapDispatch)(PublishCollectionModal)
