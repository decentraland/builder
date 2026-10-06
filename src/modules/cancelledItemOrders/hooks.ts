import { useEffect } from 'react'
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
