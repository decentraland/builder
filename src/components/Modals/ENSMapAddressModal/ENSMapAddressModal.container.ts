import { connect } from 'react-redux'
import { SET_ENS_ADDRESS_REQUEST, setENSAddressRequest } from 'modules/ens/actions'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getError, getLoading, isWaitingTxSetAddress } from 'modules/ens/selectors'
import { RootState } from 'modules/common/types'
import { MapDispatch, MapDispatchProps, OwnProps } from './ENSMapAddressModal.types'
import EnsMapAddressModal from './ENSMapAddressModal'

const mapState = (state: RootState) => {
  const error = getError(state)
  return {
    isLoading: isLoadingType(getLoading(state), SET_ENS_ADDRESS_REQUEST) || isWaitingTxSetAddress(state),
    error: error ? error.message : null
  }
}

const mapDispatch = (dispatch: MapDispatch, ownProps: OwnProps): MapDispatchProps => ({
  onSave: ((address: string) => dispatch(setENSAddressRequest(ownProps.metadata.ens, address))) as any
})

export default connect(mapState, mapDispatch)(EnsMapAddressModal)
