import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { MapDispatchProps, MapDispatch } from './SceneCreationSelector.types'
import SceneCreationSelector from './SceneCreationSelector'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name: string, metadata?: any) => dispatch(openModal(name, metadata)),
  onNavigate: path => dispatch(push(path))
})

export default connect(null, mapDispatch)(SceneCreationSelector)
