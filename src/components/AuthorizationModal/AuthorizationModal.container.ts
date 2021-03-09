import { connect } from 'react-redux'
import { RootState } from 'modules/common/types'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData, getTransactions, getLoading } from 'decentraland-dapps/dist/modules/authorization/selectors'
import {
  grantTokenRequest,
  GRANT_TOKEN_REQUEST,
  revokeTokenRequest,
  REVOKE_TOKEN_REQUEST
} from 'decentraland-dapps/dist/modules/authorization/actions'
import { isPending } from 'decentraland-dapps/dist/modules/transaction/utils'
import { areEqual } from 'decentraland-dapps/dist/modules/authorization/utils'
import { MapStateProps, MapDispatchProps, MapDispatch, OwnProps } from './AuthorizationModal.types'
import AuthorizationModal from './AuthorizationModal'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const hasPendingTransaction = getTransactions(state).some(
    tx => areEqual(tx.payload.authorization, ownProps.authorization) && isPending(tx.status)
  )

  return {
    authorizations: getData(state),
    isLoading: isLoadingType(getLoading(state), GRANT_TOKEN_REQUEST) || isLoadingType(getLoading(state), REVOKE_TOKEN_REQUEST),
    hasPendingTransaction
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onGrant: (authorization: Authorization) => dispatch(grantTokenRequest(authorization)),
  onRevoke: (authorization: Authorization) => dispatch(revokeTokenRequest(authorization))
})

export default connect(mapState, mapDispatch)(AuthorizationModal)
