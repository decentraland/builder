import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'

export type Props = {
  collection: Collection
  items: Item[]
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'items'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
export type OwnProps = Pick<Props, 'collection'>
