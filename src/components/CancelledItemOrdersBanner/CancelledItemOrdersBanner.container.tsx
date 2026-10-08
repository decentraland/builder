import React from 'react'
import { useSelector } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { useFetchCancelledItemOrders } from 'modules/cancelledItemOrders/hooks'
import { getCancelledItemOrdersGroups, isCancelledItemOrdersIncomplete } from 'modules/cancelledItemOrders/selectors'
import CancelledItemOrdersBanner from './CancelledItemOrdersBanner'

const CancelledItemOrdersBannerContainer: React.FC = () => {
  const isEnabled = useFetchCancelledItemOrders()
  const address = useSelector(getAddress)
  const groups = useSelector(getCancelledItemOrdersGroups)
  const isIncomplete = useSelector(isCancelledItemOrdersIncomplete)

  if (!isEnabled || !address) {
    return null
  }

  return <CancelledItemOrdersBanner address={address} groups={groups} isIncomplete={isIncomplete} />
}

export default CancelledItemOrdersBannerContainer
