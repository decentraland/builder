import { Dispatch } from 'redux'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'

export type Props = {
  collection: Collection
  curation: CollectionCuration | null
  items: Item[]
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'items'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch
export type OwnProps = Pick<Props, 'collection' | 'curation'>
