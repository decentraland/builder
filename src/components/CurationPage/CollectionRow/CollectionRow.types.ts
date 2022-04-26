import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Collection } from 'modules/collection/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'

export type Props = {
  address?: string
  collection: Collection
  curation: CollectionCuration | null
  itemCount: number
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'address' | 'itemCount'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
export type OwnProps = Pick<Props, 'collection' | 'curation'>
