import { connect } from 'react-redux'
import { push, goBack } from 'connected-react-router'
import { getData as getWallet, getMana } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { openModal } from 'modules/modal/actions'
import { RootState } from 'modules/common/types'
import { MapDispatchProps, MapDispatch, MapStateProps } from './ClaimENSPage.types'
import ClaimENSPage from './ClaimENSPage'

const mapState = (state: RootState): MapStateProps => {
  return {
    wallet: getWallet(state),
    mana: getMana(state)!
  }
}
const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata)),
  onNavigate: path => dispatch(push(path)),
  onBack: () => dispatch(goBack())
})

export default connect(mapState, mapDispatch)(ClaimENSPage)
