import { connect } from 'react-redux'
import { push, goBack } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ClaimENSPage.types'
import ClaimENSPage from './ClaimENSPage'

const mapState = (_state: RootState): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onBack: () => dispatch(goBack())
})

export default connect(mapState, mapDispatch)(ClaimENSPage)
