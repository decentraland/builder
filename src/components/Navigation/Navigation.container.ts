import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { isWalletCommitteeMember } from 'modules/committee/selectors'
import { MapStateProps } from './Navigation.types'
import Navigation from './Navigation'

const mapState = (state: RootState): MapStateProps => ({
  isCommitteeMember: isWalletCommitteeMember(state)
})

export default connect(mapState)(Navigation)
