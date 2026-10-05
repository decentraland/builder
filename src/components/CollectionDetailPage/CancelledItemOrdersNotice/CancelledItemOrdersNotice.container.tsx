import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { RootState } from 'modules/common/types'
import { useFetchCancelledItemOrders } from 'modules/cancelledTrades/hooks'
import { getCancelledItemOrdersByContractAddress } from 'modules/cancelledTrades/selectors'
import CancelledItemOrdersNotice from './CancelledItemOrdersNotice'
import { OwnProps } from './CancelledItemOrdersNotice.types'

const CancelledItemOrdersNoticeContainer: React.FC<OwnProps> = ({ collection, items }) => {
  const dispatch = useDispatch()
  const isEnabled = useFetchCancelledItemOrders()
  const orders = useSelector((state: RootState) => getCancelledItemOrdersByContractAddress(state, collection.contractAddress))
  const onOpenModal: ActionFunction<typeof openModal> = useCallback((name, metadata) => dispatch(openModal(name, metadata)), [dispatch])

  if (!isEnabled) {
    return null
  }

  return <CancelledItemOrdersNotice collection={collection} items={items} orders={orders} onOpenModal={onOpenModal} />
}

export default CancelledItemOrdersNoticeContainer
