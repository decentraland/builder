import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { PushCollectionCurationRequestAction } from 'modules/curations/collectionCuration/actions'

export type Props = ModalProps & {
  metadata: PushCollectionChangesModalMetadata
  isLoading: boolean
  onProceed: () => void
}

export type PushCollectionChangesModalMetadata = {
  collectionId: string
}

export type MapStateProps = Pick<Props, 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onProceed'>
export type MapDispatch = Dispatch<PushCollectionCurationRequestAction>
export type OwnProps = Pick<Props, 'metadata'>
