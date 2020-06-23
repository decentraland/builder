import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, OwnProps, MapDispatch } from './EstateEditorModal.types'
import EstateEditorModal from './EstateEditorModal'

const mapState = (_state: RootState, _ownProps: OwnProps): MapStateProps => ({})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(EstateEditorModal)
