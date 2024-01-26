import { connect } from 'react-redux'
import {
  SET_ENS_ADDRESS_REQUEST,
  SET_ENS_RESOLVER_REQUEST,
  clearENSErrors,
  setENSAddressRequest,
  setENSResolverRequest
} from 'modules/ens/actions'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getENSBySubdomain, getError, getLoading, isWaitingTxSetAddress, isWaitingTxSetResolver } from 'modules/ens/selectors'
import { RootState } from 'modules/common/types'
import { MapDispatch, MapDispatchProps, OwnProps } from './ENSMapAddressModal.types'
import EnsMapAddressModal from './ENSMapAddressModal'

const mapState = (state: RootState, ownProps: OwnProps) => {
  const error = getError(state)
  return {
    isLoading: isLoadingType(getLoading(state), SET_ENS_ADDRESS_REQUEST) || isWaitingTxSetAddress(state),
    isLoadingSetResolver: isLoadingType(getLoading(state), SET_ENS_RESOLVER_REQUEST),
    isWaitingTxSetResolver: isWaitingTxSetResolver(state),
    error: error ? error.message : null,
    ens: getENSBySubdomain(state, ownProps.metadata.ens.subdomain)
  }
}

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => ({
  onSave: ((address: string) => dispatch(setENSAddressRequest(ownProps.metadata.ens, address))) as any,
  onUnmount: () => dispatch(clearENSErrors()),
  onSetENSResolver: ens => dispatch(setENSResolverRequest(ens))
})

export default connect(mapState, mapDispatch)(EnsMapAddressModal)
