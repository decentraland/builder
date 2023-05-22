import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { withAuthorizedAction } from 'decentraland-dapps/dist/containers'
import { AuthorizedAction } from 'decentraland-dapps/dist/containers/withAuthorizedAction/AuthorizationModal'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getClaimNameStatus, getLoading, isWaitingTxClaimName, getErrorMessage } from 'modules/ens/selectors'
import { claimNameRequest, CLAIM_NAME_REQUEST } from 'modules/ens/actions'
import { MapDispatch, MapDispatchProps } from './ClaimNameFatFingerModal.types'
import ClaimNameFatFingerModal from './ClaimNameFatFingerModal'

const mapState = (state: RootState) => ({
  isLoading: isLoadingType(getLoading(state), CLAIM_NAME_REQUEST) || isWaitingTxClaimName(state),
  address: getAddress(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: path => dispatch(push(path)),
  onClaim: name => dispatch(claimNameRequest(name))
})

export default connect(
  mapState,
  mapDispatch
)(
  withAuthorizedAction(
    ClaimNameFatFingerModal,
    AuthorizedAction.CLAIM_NAME,
    {
      title_action: 'claim_name_fat_finger_modal.authorization.title_action',
      action: 'claim_name_fat_finger_modal.authorization.action'
    },
    getClaimNameStatus,
    getErrorMessage
  )
)
