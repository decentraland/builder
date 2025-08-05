import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { retrySync } from 'modules/sync/actions'
import { dismissSyncedToast, dismissSignInToast } from 'modules/ui/dashboard/actions'

export type Props = {
  syncCount: number
  errorCount: number
  projectCount: number
  isLoggedIn: boolean
  didDismissSignInToast: boolean
  didDismissSyncedToast: boolean
  onRetry: ActionFunction<typeof retrySync>
  onOpenModal: ActionFunction<typeof openModal>
  onDismissSyncedToast: ActionFunction<typeof dismissSyncedToast>
  onDismissSignInToast: ActionFunction<typeof dismissSignInToast>
}

export type State = {
  isSynced: boolean
}
