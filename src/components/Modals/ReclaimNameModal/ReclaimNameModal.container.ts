import { connect } from 'react-redux'
import { clearENSErrors, reclaimNameRequest } from 'modules/ens/actions'
import { getENSBySubdomain, getError, isReclaimingName, isWaitingTxReclaim } from 'modules/ens/selectors'
import { RootState } from 'modules/common/types'
import { MapDispatch, MapDispatchProps, OwnProps } from './ReclaimNameModal.types'
import EnsMapAddressModal from './ReclaimNameModal'

const mapState = (state: RootState, ownProps: OwnProps) => {
  const error = getError(state)
  const ens = getENSBySubdomain(state, ownProps.metadata.ens.subdomain)
  return {
    isLoadingReclaim: ens ? isReclaimingName(state, ens.subdomain) : false,
    isWaitingTxReclaim: isWaitingTxReclaim(state),
    error: error ? error.message : null,
    ens
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onUnmount: () => dispatch(clearENSErrors()),
  onReclaim: ens => dispatch(reclaimNameRequest(ens))
})

export default connect(mapState, mapDispatch)(EnsMapAddressModal)
