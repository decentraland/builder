import { Dispatch } from 'redux'
import { fetchCollectionsRequest, FetchCollectionsRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'

export type Props = {
  address?: string
  collections: Collection[]
  value?: Collection
  placeholder?: string
  filter?: (collection: Collection) => boolean
  onChange: (collection: Collection) => void
  isDisabled?: boolean
  onFetchCollections: typeof fetchCollectionsRequest
}

export type MapStateProps = Pick<Props, 'collections' | 'address'>
export type MapDispatchProps = Pick<Props, 'onFetchCollections'>
export type MapDispatch = Dispatch<FetchCollectionsRequestAction>
export type OwnProps = Pick<Props, 'filter' | 'onChange'>
