import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { deleteCollectionRequest } from 'modules/collection/actions'
import { getName } from 'modules/profile/selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { MapDispatchProps, MapDispatch, MapStateProps } from './CollectionContextMenu.types'
import CollectionContextMenu from './CollectionContextMenu'

const mapState = (state: RootState): MapStateProps => ({
  name: getName(state) || ''
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onDelete: collection => dispatch(deleteCollectionRequest(collection))
})

export default connect(mapState, mapDispatch)(CollectionContextMenu)
