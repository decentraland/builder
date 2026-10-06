import React, { useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { RootState } from 'modules/common/types'
import { useFetchCancelledItemOrders } from 'modules/cancelledItemOrders/hooks'
import { getCancelledItemOrdersByContractAddress, isCancelledItemOrdersIncomplete } from 'modules/cancelledItemOrders/selectors'
import CancelledItemOrdersNotice from './CancelledItemOrdersNotice'
import { OwnProps } from './CancelledItemOrdersNotice.types'

const CancelledItemOrdersNoticeContainer: React.FC<OwnProps> = ({ collection, items }) => {
  const dispatch = useDispatch()
  const isEnabled = useFetchCancelledItemOrders()
  // The selector filters into a new array on every call
  const orders = useSelector((state: RootState) => getCancelledItemOrdersByContractAddress(state, collection.contractAddress), shallowEqual)
  const isIncomplete = useSelector(isCancelledItemOrdersIncomplete)
  const onOpenModal: ActionFunction<typeof openModal> = useCallback((name, metadata) => dispatch(openModal(name, metadata)), [dispatch])

  if (!isEnabled) {
    return null
  }

  return (
    <CancelledItemOrdersNotice
      collection={collection}
      items={items}
      orders={orders}
      isIncomplete={isIncomplete}
      onOpenModal={onOpenModal}
    />
  )
}

export default CancelledItemOrdersNoticeContainer
