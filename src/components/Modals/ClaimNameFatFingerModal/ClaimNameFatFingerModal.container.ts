import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { claimNameRequest } from 'modules/ens/actions'
import { MapDispatch, MapDispatchProps } from './ClaimNameFatFingerModal.types'
import ClaimNameFatFingerModal from './ClaimNameFatFingerModal'

const mapState = (state: RootState) => ({
  address: getAddress(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClaim: name => dispatch(claimNameRequest(name))
})

export default connect(mapState, mapDispatch)(ClaimNameFatFingerModal)
