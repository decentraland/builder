import { Dispatch } from 'redux'
import { retrySync, RetrySyncAction } from 'modules/sync/actions'
import { dismissSyncedToast, dismissSignInToast, DismissSyncedToastAction, DismissSignInToastAction } from 'modules/ui/dashboard/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  syncCount: number
  errorCount: number
  projectCount: number
  isLoggedIn: boolean
  didDismissSignInToast: boolean
  didDismissSyncedToast: boolean
  onRetry: typeof retrySync
  onOpenModal: typeof openModal
  onDismissSyncedToast: typeof dismissSyncedToast
  onDismissSignInToast: typeof dismissSignInToast
}

export type State = {
  isSynced: boolean
}

export type MapStateProps = Pick<
  Props,
  'syncCount' | 'errorCount' | 'projectCount' | 'isLoggedIn' | 'didDismissSignInToast' | 'didDismissSyncedToast'
>
export type MapDispatchProps = Pick<Props, 'onRetry' | 'onOpenModal' | 'onDismissSyncedToast' | 'onDismissSignInToast'>
export type MapDispatch = Dispatch<RetrySyncAction | OpenModalAction | DismissSyncedToastAction | DismissSignInToastAction>
