import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getIsCancelledItemOrdersNoticeEnabled } from 'modules/features/selectors'
import { fetchCancelledItemOrdersRequest } from './actions'
import { getFetchedFor } from './selectors'

/** Fetches the connected wallet's cancelled item orders once, when the feature is on. Returns whether it is. */
export function useFetchCancelledItemOrders(): boolean {
  const dispatch = useDispatch()
  const isEnabled = useSelector(getIsCancelledItemOrdersNoticeEnabled)
  const address = useSelector(getAddress)
  const fetchedFor = useSelector(getFetchedFor)

  useEffect(() => {
    if (isEnabled && address && fetchedFor !== address) {
      dispatch(fetchCancelledItemOrdersRequest(address))
    }
  }, [isEnabled, address, fetchedFor, dispatch])

  return isEnabled
}

function readDismissed(storageKey: string): boolean {
  try {
    return localStorage.getItem(storageKey) !== null
  } catch {
    return false
  }
}

/** Local, per-browser dismissal of a notice. */
export function useDismissedNotice(storageKey: string): [boolean, () => void] {
  const [isDismissed, setIsDismissed] = useState(() => readDismissed(storageKey))

  useEffect(() => {
    setIsDismissed(readDismissed(storageKey))
  }, [storageKey])

  const dismiss = useCallback(() => {
    setIsDismissed(true)
    try {
      localStorage.setItem(storageKey, '1')
    } catch {
      // Storage unavailable: dismissal lasts for this render only
    }
  }, [storageKey])

  return [isDismissed, dismiss]
}
