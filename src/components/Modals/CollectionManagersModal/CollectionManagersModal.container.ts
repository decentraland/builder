import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { SET_COLLECTION_MANAGERS_REQUEST, setCollectionManagersRequest } from 'modules/collection/actions'
import { getCollection, getLoading } from 'modules/collection/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionManagersModal.types'
import CollectionManagersModal from './CollectionManagersModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  let { collectionId } = ownProps.metadata

  if (!collectionId) {
    throw new Error('Invalid collection id to add managers')
  }

  return {
    collection: getCollection(state, collectionId)!,
    isLoading: isLoadingType(getLoading(state), SET_COLLECTION_MANAGERS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetManagers: (collection, managers) => dispatch(setCollectionManagersRequest(collection, managers))
})

export default connect(mapState, mapDispatch)(CollectionManagersModal)
