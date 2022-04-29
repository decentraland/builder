import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { getAddress, getChainId, isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { isWalletCommitteeMember } from 'modules/committee/selectors'
import { getSelectedCollectionId, isReviewing } from 'modules/location/selectors'
import { setCollectionCurationAssigneeRequest } from 'modules/curations/collectionCuration/actions'
import { initiateApprovalFlow, initiateTPApprovalFlow } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './TopPanel.types'
import TopPanel from './TopPanel'

const mapState = (state: RootState): MapStateProps => ({
  address: getAddress(state),
  chainId: getChainId(state),
  isConnected: isConnected(state),
  isReviewing: isReviewing(state),
  isCommitteeMember: isWalletCommitteeMember(state),
  selectedCollectionId: getSelectedCollectionId(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onSetAssignee: (collectionId, assignee, curation) => dispatch(setCollectionCurationAssigneeRequest(collectionId, assignee, curation)),
  onInitiateTPApprovalFlow: collection => dispatch(initiateTPApprovalFlow(collection)),
  onInitiateApprovalFlow: collection => dispatch(initiateApprovalFlow(collection))
})

export default connect(mapState, mapDispatch)(TopPanel)
