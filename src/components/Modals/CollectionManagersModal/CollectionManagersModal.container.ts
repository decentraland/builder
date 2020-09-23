import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { MINT_COLLECTION_ITEMS_REQUEST } from 'modules/collection/actions'
import { getCollection } from 'modules/collection/selectors'
import { setCollectionManagersRequest } from 'modules/collection/actions'
import { getLoading } from 'modules/item/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionManagersModal.types'
import CollectionManagersModal from './CollectionManagersModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  let { collectionId } = ownProps.metadata

  if (!collectionId) {
    throw new Error('Invalid collection id to add collaborators')
  }

  return {
    collection: getCollection(state, collectionId)!,
    isLoading: isLoadingType(getLoading(state), MINT_COLLECTION_ITEMS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetManagers: (collection, collaborators) => dispatch(setCollectionManagersRequest(collection, collaborators))
})

export default connect(mapState, mapDispatch)(CollectionManagersModal)
