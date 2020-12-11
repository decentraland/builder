import { connect } from 'react-redux'
import { push, goBack } from 'connected-react-router'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { claimNameRequest } from 'modules/ens/actions'
import { getENSByWallet } from 'modules/ens/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ClaimENSPage.types'
import ClaimENSPage from './ClaimENSPage'

const mapState = (state: RootState): MapStateProps => ({
  ensList: getENSByWallet(state), // this need to be replaced by all the ENS
  address: getAddress(state) || ''
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onClaim: name => dispatch(claimNameRequest(name)),
  onNavigate: path => dispatch(push(path)),
  onBack: () => dispatch(goBack())
})

export default connect(mapState, mapDispatch)(ClaimENSPage)
