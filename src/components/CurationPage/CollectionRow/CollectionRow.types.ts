import { Dispatch } from 'redux'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { Curation } from 'modules/curation/types'

export type Props = {
  collection: Collection
  curation: Curation | null
  items: Item[]
}

export type MapStateProps = Pick<Props, 'items'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
export type OwnProps = Pick<Props, 'collection' | 'curation'>
