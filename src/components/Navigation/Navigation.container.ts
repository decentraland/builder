import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { isWalletCommitteeMember } from 'modules/committee/selectors'
import { MapStateProps, MapDispatchProps, MapDispatch } from './Navigation.types'
import Navigation from './Navigation'

const mapState = (state: RootState): MapStateProps => ({
  isCommitteeMember: isWalletCommitteeMember(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(Navigation)
