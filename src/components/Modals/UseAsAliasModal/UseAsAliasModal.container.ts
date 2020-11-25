import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getAliases, getLoading } from 'modules/ens/selectors'
import { setAliasRequest, SET_ALIAS_REQUEST } from 'modules/ens/actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './UseAsAliasModal.types'
import UseAsAliasModal from './UseAsAliasModal'
import { getName } from 'modules/profile/selectors'

const mapState = (state: RootState): MapStateProps => ({
  isLoading: isLoadingType(getLoading(state), SET_ALIAS_REQUEST),
  aliases: getAliases(state),
  name: getName(state) || '',
  address: getAddress(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: (address, name) => dispatch(setAliasRequest(address, name))
})

export default connect(mapState, mapDispatch)(UseAsAliasModal)
