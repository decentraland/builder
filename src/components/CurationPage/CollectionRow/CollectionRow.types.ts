import { Dispatch } from 'redux'
import { Collection } from 'modules/collection/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'

export type Props = {
  collection: Collection
  curation: CollectionCuration | null
  itemCount: number
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'itemCount'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch
export type OwnProps = Pick<Props, 'collection' | 'curation'>
