import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import {
  SET_COLLECTION_MANAGERS_REQUEST,
  SET_COLLECTION_MINTERS_REQUEST,
  setCollectionManagersRequest,
  setCollectionMintersRequest
} from 'modules/collection/actions'
import { getCollection, getLoading } from 'modules/collection/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './ManageCollectionRoleModal.types'
import ManageCollectionRoleModal from './ManageCollectionRoleModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  let { collectionId } = ownProps.metadata

  if (!collectionId) {
    throw new Error('Invalid collection id to add managers')
  }

  return {
    wallet: getWallet(state)!,
    collection: getCollection(state, collectionId)!,
    isLoading:
      isLoadingType(getLoading(state), SET_COLLECTION_MANAGERS_REQUEST) || isLoadingType(getLoading(state), SET_COLLECTION_MINTERS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetManagers: (collection, managers) => dispatch(setCollectionManagersRequest(collection, managers)),
  onSetMinters: (collection, minters) => dispatch(setCollectionMintersRequest(collection, minters))
})

export default connect(mapState, mapDispatch)(ManageCollectionRoleModal)
