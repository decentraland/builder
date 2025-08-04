import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'

import { RootState } from 'modules/common/types'
import { getLoadingSet, getErrorSet } from 'modules/sync/selectors'
import { retrySync } from 'modules/sync/actions'
import { didDismissSignInToast, didDismissSyncedToast } from 'modules/ui/dashboard/selectors'
import { dismissSignInToast, dismissSyncedToast } from 'modules/ui/dashboard/actions'
import { isLoggedIn } from 'modules/identity/selectors'
import { useGetProjects } from 'modules/ui/dashboard/hooks'
import SyncToast from './SyncToast'

const SyncToastContainer: React.FC = () => {
  const dispatch = useDispatch()
  const projects = useGetProjects()

  const syncCount = useSelector((state: RootState) => getLoadingSet(state).size)
  const errorCount = useSelector((state: RootState) => getErrorSet(state).size)
  const projectCount = projects.length
  const isUserLoggedIn = useSelector(isLoggedIn)
  const didDismissSignInToastState = useSelector(didDismissSignInToast)
  const didDismissSyncedToastState = useSelector(didDismissSyncedToast)

  const onRetry: ActionFunction<typeof retrySync> = useCallback(() => {
    dispatch(retrySync())
  }, [dispatch])
  const onOpenModal: ActionFunction<typeof openModal> = useCallback(
    (name, metadata) => {
      dispatch(openModal(name, metadata))
    },
    [dispatch]
  )
  const onDismissSignInToast: ActionFunction<typeof dismissSignInToast> = useCallback(() => {
    dispatch(dismissSignInToast())
  }, [dispatch])

  const onDismissSyncedToast: ActionFunction<typeof dismissSyncedToast> = useCallback(() => {
    dispatch(dismissSyncedToast())
  }, [dispatch])

  return (
    <SyncToast
      syncCount={syncCount}
      errorCount={errorCount}
      projectCount={projectCount}
      isLoggedIn={isUserLoggedIn}
      didDismissSignInToast={didDismissSignInToastState}
      didDismissSyncedToast={didDismissSyncedToastState}
      onRetry={onRetry}
      onOpenModal={onOpenModal}
      onDismissSignInToast={onDismissSignInToast}
      onDismissSyncedToast={onDismissSyncedToast}
    />
  )
}

export default SyncToastContainer
