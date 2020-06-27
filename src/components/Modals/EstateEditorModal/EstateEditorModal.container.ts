import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, OwnProps, MapDispatch } from './EstateEditorModal.types'
import EstateEditorModal from './EstateEditorModal'
import { getLandTiles } from 'modules/land/selectors'

const mapState = (state: RootState, _ownProps: OwnProps): MapStateProps => ({
  landTiles: getLandTiles(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(EstateEditorModal)
