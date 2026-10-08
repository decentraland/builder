import { CancelledItemOrdersGroup } from 'modules/cancelledItemOrders/selectors'

export type Props = {
  address: string
  groups: CancelledItemOrdersGroup[]
  isIncomplete: boolean
}
