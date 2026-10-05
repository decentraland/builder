import React from 'react'
import { useSelector } from 'react-redux'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { useFetchCancelledItemOrders } from 'modules/cancelledTrades/hooks'
import { getCancelledItemOrdersGroups } from 'modules/cancelledTrades/selectors'
import CancelledItemOrdersBanner from './CancelledItemOrdersBanner'

const CancelledItemOrdersBannerContainer: React.FC = () => {
  const isEnabled = useFetchCancelledItemOrders()
  const address = useSelector(getAddress)
  const groups = useSelector(getCancelledItemOrdersGroups)

  if (!isEnabled || !address) {
    return null
  }

  return <CancelledItemOrdersBanner address={address} groups={groups} />
}

export default CancelledItemOrdersBannerContainer
