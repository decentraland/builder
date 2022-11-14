import { connect } from 'react-redux'
import { MapDispatchProps, MapDispatch } from './DissolveModal.types'
import DissolveModal from './DissolveModal'
import { dissolveEstateRequest } from 'modules/land/actions'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onDissolve: land => dispatch(dissolveEstateRequest(land))
})

export default connect(null, mapDispatch)(DissolveModal)
