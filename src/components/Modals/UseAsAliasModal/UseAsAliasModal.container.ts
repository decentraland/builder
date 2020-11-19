import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getLoading } from 'modules/ens/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './UseAsAliasModal.types'
import UseAsAliasModal from './UseAsAliasModal'
import { setAliasRequest, CHANGE_PROFILE_REQUEST } from 'modules/profile/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

const mapState = (state: RootState): MapStateProps => ({
  isLoading: isLoadingType(getLoading(state), CHANGE_PROFILE_REQUEST),
  address: getAddress(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: (address, name) => dispatch(setAliasRequest(address, name))
})

export default connect(mapState, mapDispatch)(UseAsAliasModal)
