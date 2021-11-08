import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { deleteCollectionRequest } from 'modules/collection/actions'
import { getName } from 'modules/profile/selectors'
import { openModal } from 'modules/modal/actions'
import { getCollectionItems } from 'modules/item/selectors'
import { MapDispatchProps, MapDispatch, MapStateProps, OwnProps } from './CollectionContextMenu.types'
import CollectionContextMenu from './CollectionContextMenu'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => ({
  items: getCollectionItems(state, ownProps.collection.id),
  name: getName(state) || ''
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onDelete: collection => dispatch(deleteCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(CollectionContextMenu)
