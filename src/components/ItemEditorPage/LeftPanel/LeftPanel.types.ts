import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  items: Item[]
  collections: Collection[]
  selectedItemId: string | null
  selectedCollectionId: string | null
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'items' | 'collections' | 'selectedItemId' | 'selectedCollectionId'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
