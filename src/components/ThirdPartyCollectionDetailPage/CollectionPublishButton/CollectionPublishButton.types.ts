import { Dispatch } from 'redux'
import { OpenModalAction } from 'modules/modal/actions'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

export type Props = {
  collection: Collection
  items: Item[]
  slots: number
  onPublish: () => void
}

export type OwnProps = Pick<Props, 'collection' | 'items' | 'slots'>
export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onPublish'>
export type MapDispatch = Dispatch<OpenModalAction>
