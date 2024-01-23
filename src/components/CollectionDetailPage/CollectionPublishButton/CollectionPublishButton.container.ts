import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { fetchCollectionCurationRequest } from 'modules/curations/collectionCuration/actions'
import { getStatusByCollectionId } from 'modules/collection/selectors'
import { getHasPendingCollectionCuration } from 'modules/curations/collectionCuration/selectors'
import { getCollectionItems } from 'modules/item/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionPublishButton.types'
import CollectionPublishButton from './CollectionPublishButton'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { id: collectionId } = ownProps.collection
  const statusByCollectionId = getStatusByCollectionId(state)

  return {
    items: getCollectionItems(state, collectionId),
    status: statusByCollectionId[collectionId],
    hasPendingCuration: getHasPendingCollectionCuration(state, collectionId)
  }
}

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => {
  const { id: collectionId } = ownProps.collection

  return {
    onPublish: () => dispatch(openModal('PublishWizardCollectionModal', { collectionId })),
    onPush: () => dispatch(openModal('PushCollectionChangesModal', { collectionId })),
    onInit: () => dispatch(fetchCollectionCurationRequest(collectionId))
  }
}

export default connect(mapState, mapDispatch)(CollectionPublishButton)
