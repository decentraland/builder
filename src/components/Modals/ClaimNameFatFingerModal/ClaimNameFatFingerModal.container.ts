import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getLoading, isWaitingTxClaimName } from 'modules/ens/selectors'
import { claimNameRequest, CLAIM_NAME_REQUEST } from 'modules/ens/actions'
import { MapDispatch, MapDispatchProps } from './ClaimNameFatFingerModal.types'
import ClaimNameFatFingerModal from './ClaimNameFatFingerModal'

const mapState = (state: RootState) => ({
  isLoading: isLoadingType(getLoading(state), CLAIM_NAME_REQUEST) || isWaitingTxClaimName(state),
  address: getAddress(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClaim: name => dispatch(claimNameRequest(name))
})

export default connect(mapState, mapDispatch)(ClaimNameFatFingerModal)
