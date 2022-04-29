import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Collection } from 'modules/collection/types'

export type Props = {
  collection: Collection
  itemCount: number
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'itemCount'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
export type OwnProps = Pick<Props, 'collection'>
