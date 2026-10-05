import { CancelledItemOrdersGroup } from 'modules/cancelledTrades/selectors'

export type Props = {
  address: string
  groups: CancelledItemOrdersGroup[]
  isIncomplete: boolean
}
