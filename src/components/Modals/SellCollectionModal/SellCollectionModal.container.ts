import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollection, getLoading, getStatusByCollectionId } from 'modules/collection/selectors'
import { setCollectionMintersRequest, SET_COLLECTION_MINTERS_REQUEST } from 'modules/collection/actions'
import { OwnProps, MapStateProps, MapDispatchProps, MapDispatch } from './SellCollectionModal.types'
import SellCollectionModal from './SellCollectionModal'
import { UNSYNCED_STATES } from 'modules/item/utils'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const { collectionId } = ownProps.metadata

  return {
    collection: getCollection(state, collectionId)!,
    wallet: getWallet(state)!,
    isLoading: isLoadingType(getLoading(state), SET_COLLECTION_MINTERS_REQUEST),
    hasUnsyncedItems: UNSYNCED_STATES.has(getStatusByCollectionId(state)[collectionId])
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSetMinters: (collection, minters) => dispatch(setCollectionMintersRequest(collection, minters))
})

export default connect(mapState, mapDispatch)(SellCollectionModal)
