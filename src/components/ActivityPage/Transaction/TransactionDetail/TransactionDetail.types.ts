import { Coord } from 'decentraland-ui'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'

export type Props = {
  selection: Coord[]
  text: React.ReactNode
  tx: Transaction
}

export type MapStateProps = {}
export type MapDispatchProps = {}
