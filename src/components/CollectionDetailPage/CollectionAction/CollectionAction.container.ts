import { connect } from 'react-redux'
import { getData as getAuthorizations } from 'decentraland-dapps/dist/modules/authorization/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionItems, getStatusByCollectionId } from 'modules/collection/selectors'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './CollectionAction.types'
import CollectionAction from './CollectionAction'
import { fetchCurationRequest } from 'modules/curation/actions'
import { getHasPendingCuration } from 'modules/curation/selectors'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { id: collectionId } = ownProps.collection
  const statusByCollectionId = getStatusByCollectionId(state)

  return {
    wallet: getWallet(state)!,
    items: getCollectionItems(state, collectionId),
    authorizations: getAuthorizations(state),
    status: statusByCollectionId[collectionId],
    isAwaitingCuration: getHasPendingCuration(state, collectionId)
  }
}

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => {
  const { id: collectionId } = ownProps.collection

  return {
    onPublish: () => dispatch(openModal('PublishCollectionModal', { collectionId })),
    onPush: () => dispatch(openModal('PushCollectionChangesModal', { collectionId })),
    onInit: () => dispatch(fetchCurationRequest(collectionId))
  }
}

export default connect(mapState, mapDispatch)(CollectionAction)
