import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  selectedCollectionId: string | null
  collections: Collection[]
  items: Item[]
  hasHeader: boolean
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'collections' | 'items' | 'selectedCollectionId'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
