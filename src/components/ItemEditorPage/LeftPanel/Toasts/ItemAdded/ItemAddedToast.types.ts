import { Dispatch } from 'redux'
import { CallHistoryMethodAction, replace } from 'connected-react-router'

export type Props = {
  collectionId: string | null
  itemName: string | null
  search: string
  onReplace: (location: Parameters<typeof replace>[0]) => void
}

export type MapStateProps = Pick<Props, 'itemName' | 'search'>
export type MapDispatchProps = Pick<Props, 'onReplace'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
