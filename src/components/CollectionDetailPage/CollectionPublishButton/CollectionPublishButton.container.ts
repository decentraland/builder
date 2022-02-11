import { connect } from 'react-redux'
import { getData as getAuthorizations } from 'decentraland-dapps/dist/modules/authorization/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { fetchCollectionCurationRequest } from 'modules/collectionCuration/actions'
import { getHasPendingCuration } from 'modules/collectionCuration/selectors'
import { getStatusByCollectionId } from 'modules/collection/selectors'
import { getCollectionItems } from 'modules/item/selectors'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionPublishButton.types'
import CollectionPublishButton from './CollectionPublishButton'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { id: collectionId } = ownProps.collection
  const statusByCollectionId = getStatusByCollectionId(state)

  return {
    wallet: getWallet(state)!,
    items: getCollectionItems(state, collectionId),
    authorizations: getAuthorizations(state),
    status: statusByCollectionId[collectionId],
    hasPendingCuration: getHasPendingCuration(state, collectionId)
  }
}

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => {
  const { id: collectionId } = ownProps.collection

  return {
    onPublish: () => dispatch(openModal('PublishCollectionModal', { collectionId })),
    onPush: () => dispatch(openModal('PushCollectionChangesModal', { collectionId })),
    onInit: () => dispatch(fetchCollectionCurationRequest(collectionId))
  }
}

export default connect(mapState, mapDispatch)(CollectionPublishButton)
