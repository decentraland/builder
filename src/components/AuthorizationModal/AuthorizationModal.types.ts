import { Dispatch } from 'redux'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import {
  grantTokenRequest,
  GrantTokenRequestAction,
  revokeTokenRequest,
  RevokeTokenRequestAction
} from 'decentraland-dapps/dist/modules/authorization/actions'

export type Props = {
  open: boolean
  wallet: Wallet
  authorization: Authorization
  authorizations: Authorization[]
  hasPendingTransaction: boolean
  onGrant: typeof grantTokenRequest
  onRevoke: typeof revokeTokenRequest
  onCancel: () => void
  onProceed: () => void
}

export type MapStateProps = Pick<Props, 'wallet' | 'authorizations' | 'hasPendingTransaction'>
export type MapDispatchProps = Pick<Props, 'onGrant' | 'onRevoke'>
export type MapDispatch = Dispatch<GrantTokenRequestAction | RevokeTokenRequestAction>
export type OwnProps = Pick<Props, 'open' | 'authorization' | 'onProceed' | 'onCancel'>
