import { connect } from 'react-redux'
import { getSearch, push } from 'connected-react-router'
import { getCollections } from 'modules/collection/selectors'
import { Collection } from 'modules/collection/types'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './Header.types'
import Header from './Header'
import { deleteCollectionRequest } from 'modules/collection/actions'
import { deleteItemRequest } from 'modules/item/actions'

const mapState = (state: RootState): MapStateProps => {
  const search = getSearch(state)
  let collection: Collection | undefined
  const collectionId = new URLSearchParams(search).get('collection')
  if (collectionId) {
    const collections = getCollections(state)
    collection = collections.find(collection => collection.id === collectionId)
  }
  return {
    collection
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onNavigate: path => dispatch(push(path)),
  onDeleteCollection: collection => dispatch(deleteCollectionRequest(collection)),
  onDeleteItem: item => dispatch(deleteItemRequest(item))
})

export default connect(mapState, mapDispatch)(Header)
