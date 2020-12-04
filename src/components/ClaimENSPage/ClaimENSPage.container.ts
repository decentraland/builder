import { connect } from 'react-redux'
import { push, goBack } from 'connected-react-router'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { openModal } from 'modules/modal/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ClaimENSPage.types'
import ClaimENSPage from './ClaimENSPage'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state) || ''
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onNavigate: path => dispatch(push(path)),
  onBack: () => dispatch(goBack())
})

export default connect(mapState, mapDispatch)(ClaimENSPage)
