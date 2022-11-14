import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './EstateEditorModal.types'
import EstateEditorModal from './EstateEditorModal'
import { getLandTiles } from 'modules/land/selectors'
import { createEstateRequest, editEstateRequest } from 'modules/land/actions'

const mapState = (state: RootState): MapStateProps => ({
  landTiles: getLandTiles(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onCreateEstate: (name, description, coords) => dispatch(createEstateRequest(name, description, coords)),
  onEditEstate: (land, toAdd, toRemove) => dispatch(editEstateRequest(land, toAdd, toRemove))
})

export default connect(mapState, mapDispatch)(EstateEditorModal)
