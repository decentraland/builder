import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getCollections, hasViewAndEditRights } from 'modules/collection/selectors'
import { getSelectedCollectionId, isReviewing } from 'modules/location/selectors'
import { Collection } from 'modules/collection/types'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { deleteCollectionRequest } from 'modules/collection/actions'
import { deleteItemRequest } from 'modules/item/actions'
import { isLoggedIn } from 'modules/identity/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './Header.types'
import Header from './Header'

const mapState = (state: RootState): MapStateProps => {
  let collection: Collection | undefined
  const collectionId = getSelectedCollectionId(state)
  if (collectionId) {
    const collections = getCollections(state)
    collection = collections.find(collection => collection.id === collectionId)
  }
  const address = getAddress(state)
  return {
    address,
    isLoggedIn: isLoggedIn(state),
    isReviewing: isReviewing(state),
    collection,
    hasEditRights: collection !== undefined && address !== undefined && hasViewAndEditRights(state, address, collection)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onNavigate: path => dispatch(push(path)),
  onDeleteCollection: collection => dispatch(deleteCollectionRequest(collection)),
  onDeleteItem: item => dispatch(deleteItemRequest(item))
})

export default connect(mapState, mapDispatch)(Header)
