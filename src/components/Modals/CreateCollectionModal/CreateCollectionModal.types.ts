import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { SaveCollectionRequestAction, saveCollectionRequest } from 'modules/collection/actions'
import { OpenModalAction } from 'decentraland-dapps/dist/modules/modal'

export type Props = ModalProps & {
  address?: string
  isLoading: boolean
  onSubmit: typeof saveCollectionRequest
  onBack: () => void
  isLinkedWearablesPaymentsEnabled: boolean
  error: string | null
}

export type State = {
  collectionName: string
}

export type MapStateProps = Pick<Props, 'address' | 'isLoading' | 'error' | 'isLinkedWearablesPaymentsEnabled'>
export type MapDispatchProps = Pick<Props, 'onSubmit' | 'onBack'>
export type OwnProps = Pick<Props, 'metadata' | 'onClose' | 'name'>
export type MapDispatch = Dispatch<SaveCollectionRequestAction | OpenModalAction>
