import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { saveCollectionRequest, SaveCollectionRequestAction } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'

export type State = {
  name: string
}

export type Props = ModalProps & {
  metadata: EditCollectionNameModalMetadata
  isLoading: boolean
  onSubmit: typeof saveCollectionRequest
}

export type EditCollectionNameModalMetadata = {
  collection: Collection
}

export type MapStateProps = Pick<Props, 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onSubmit'>
export type MapDispatch = Dispatch<SaveCollectionRequestAction>
