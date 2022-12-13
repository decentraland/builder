import { Dispatch } from 'redux'
import { FetchCollectionsParams } from 'lib/api/builder'
import { fetchCollectionsRequest, FetchCollectionsRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'

export type Props = {
  address?: string
  collections: Collection[]
  value?: Collection
  placeholder?: string
  filter?: (collection: Collection) => boolean
  fetchCollectionParams?: FetchCollectionsParams
  onChange: (collection: Collection) => void
  isDisabled?: boolean
  onFetchCollections: typeof fetchCollectionsRequest
  isLoading: boolean
}

export type MapStateProps = Pick<Props, 'collections' | 'address' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onFetchCollections'>
export type MapDispatch = Dispatch<FetchCollectionsRequestAction>
export type OwnProps = Pick<Props, 'filter' | 'onChange'>
