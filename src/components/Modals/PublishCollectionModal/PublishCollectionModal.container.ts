import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { getCollection, getCollectionItems } from 'modules/collection/selectors'
import { publishCollectionRequest } from 'modules/collection/actions'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './PublishCollectionModal.types'
import PublishCollectionModal from './PublishCollectionModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collectionId } = ownProps.metadata

  return {
    collection: getCollection(state, collectionId),
    items: getCollectionItems(state, collectionId)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onPublish: (collection, items) => dispatch(publishCollectionRequest(collection, items))
})

export default connect(mapState, mapDispatch)(PublishCollectionModal)
