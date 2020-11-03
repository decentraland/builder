import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { setCollectionManagersRequest, SetCollectionManagersRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'

export type Props = ModalProps & {
  metadata: CollaboratorsModalMetadata
  collection: Collection
  isLoading: boolean
  onSetManagers: typeof setCollectionManagersRequest
}

export type State = {
  managers: (string | undefined)[]
}

export type CollaboratorsModalMetadata = {
  collectionId?: string
}

export type MapStateProps = Pick<Props, 'collection' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSetManagers'>
export type MapDispatch = Dispatch<SetCollectionManagersRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
