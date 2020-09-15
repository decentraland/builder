import { Coord } from 'decentraland-ui'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'
import { Collection } from 'modules/collection/types'

export type Props = {
  selection?: Coord[]
  address?: string
  collection?: Collection
  text: React.ReactNode
  tx: Transaction
}

export type MapStateProps = {}
export type MapDispatchProps = {}
