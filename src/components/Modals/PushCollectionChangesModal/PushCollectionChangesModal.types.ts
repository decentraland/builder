import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { PushCurationRequestAction } from 'modules/curation/actions'

export type Props = ModalProps & {
  metadata: PushCollectionChangesModalMetadata
  isLoading: boolean
  onProceed: () => void
}

export type PushCollectionChangesModalMetadata = {
  collectionId: string
}

export type MapStateProps = Pick<Props, 'isLoading'>
export type MapDispatchProps = { onProceed: (collectionId: string) => void }
export type MapDispatch = Dispatch<PushCurationRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
