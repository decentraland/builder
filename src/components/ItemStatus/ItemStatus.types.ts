import { Dispatch } from 'redux'
import { Item, SyncStatus } from 'modules/item/types'

export type Props = {
  item: Item
  status: SyncStatus
  className?: string
}

export type MapStateProps = Pick<Props, 'status'>
export type MapDispatch = Dispatch
export type OwnProps = Pick<Props, 'item'>
