import { connect } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingSetProfileAvatarAlias } from 'decentraland-dapps/dist/modules/profile/selectors'
import { setProfileAvatarAliasRequest } from 'decentraland-dapps/dist/modules/profile/actions'
import { RootState } from 'modules/common/types'
import { getAliases } from 'modules/ens/selectors'
import { getName } from 'modules/profile/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './UseAsAliasModal.types'
import UseAsAliasModal from './UseAsAliasModal'

const mapState = (state: RootState): MapStateProps => ({
  isLoading: isLoadingSetProfileAvatarAlias(state),
  aliases: getAliases(state),
  name: getName(state) || '',
  address: getAddress(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSubmit: (address, name) => dispatch(setProfileAvatarAliasRequest(address, name))
})

export default connect(mapState, mapDispatch)(UseAsAliasModal)
