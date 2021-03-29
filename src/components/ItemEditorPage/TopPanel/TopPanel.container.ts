import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { getSelectedCollectionId, isReviewing } from 'modules/location/selectors'
import { approveCollectionRequest, rejectCollectionRequest } from 'modules/collection/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './TopPanel.types'
import TopPanel from './TopPanel'

const mapState = (state: RootState): MapStateProps => ({
  isReviewing: isReviewing(state),
  selectedCollectionId: getSelectedCollectionId(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onReject: collection => dispatch(rejectCollectionRequest(collection)),
  onApprove: collection => dispatch(approveCollectionRequest(collection)),
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(TopPanel)
