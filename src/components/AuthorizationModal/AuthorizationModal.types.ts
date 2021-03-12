import { Dispatch } from 'redux'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import {
  grantTokenRequest,
  GrantTokenRequestAction,
  revokeTokenRequest,
  RevokeTokenRequestAction
} from 'decentraland-dapps/dist/modules/authorization/actions'

export type Props = {
  open: boolean
  authorization: Authorization
  authorizations: Authorization[]
  isLoading: boolean
  hasPendingTransaction: boolean
  onGrant: typeof grantTokenRequest
  onRevoke: typeof revokeTokenRequest
  onCancel: () => void
  onProceed: () => void
}

export type MapStateProps = Pick<Props, 'authorizations' | 'isLoading' | 'hasPendingTransaction'>
export type MapDispatchProps = Pick<Props, 'onGrant' | 'onRevoke'>
export type MapDispatch = Dispatch<GrantTokenRequestAction | RevokeTokenRequestAction>
export type OwnProps = Pick<Props, 'open' | 'authorization' | 'onProceed' | 'onCancel'>
