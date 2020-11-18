import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getLoading } from 'modules/ens/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './UseAsAliasModal.types'
import UseAsAliasModal from './UseAsAliasModal'
import { changeProfileRequest, CHANGE_PROFILE_REQUEST } from 'modules/ens/actions'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  isLoading: isLoadingType(getLoading(state), CHANGE_PROFILE_REQUEST)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: name => dispatch(changeProfileRequest(name))
})

export default connect(mapState, mapDispatch)(UseAsAliasModal)
