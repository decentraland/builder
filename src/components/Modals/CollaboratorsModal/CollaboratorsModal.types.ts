import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { setCollectionManagersRequest, SetCollectionManagersRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'

export type Props = ModalProps & {
  metadata: CollaboratorsModalMetadata
  collection: Collection
  isLoading: boolean
  onSetCollaborators: typeof setCollectionManagersRequest
}

export type CollaboratorsModalMetadata = {
  collectionId?: string
}

export type MapStateProps = Pick<Props, 'collection' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSetCollaborators'>
export type MapDispatch = Dispatch<SetCollectionManagersRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
