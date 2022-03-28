import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getChainId, isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { isWalletCommitteeMember } from 'modules/committee/selectors'
import { getSelectedCollectionId, isReviewing } from 'modules/location/selectors'
import { initiateApprovalFlow, initiateTPApprovalFlow } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './TopPanel.types'
import TopPanel from './TopPanel'

const mapState = (state: RootState): MapStateProps => ({
  chainId: getChainId(state),
  isConnected: isConnected(state),
  isReviewing: isReviewing(state),
  isCommitteeMember: isWalletCommitteeMember(state),
  selectedCollectionId: getSelectedCollectionId(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onInitiateTPApprovalFlow: (collection, itemsToApprove) => dispatch(initiateTPApprovalFlow(collection, itemsToApprove)),
  onInitiateApprovalFlow: collection => dispatch(initiateApprovalFlow(collection))
})

export default connect(mapState, mapDispatch)(TopPanel)
