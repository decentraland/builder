import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { OpenModalAction } from 'decentraland-dapps/dist/modules/modal'
import { SaveCollectionRequestAction, saveCollectionRequest } from 'modules/collection/actions'
import { ThirdParty } from 'modules/thirdParty/types'

export type Props = ModalProps & {
  ownerAddress?: string
  thirdParties: ThirdParty[]
  isCreatingCollection: boolean
  error: string | null
  onSubmit: typeof saveCollectionRequest
  onBack: () => void
}

export type MapStateProps = Pick<Props, 'ownerAddress' | 'thirdParties' | 'error' | 'isCreatingCollection'>
export type MapDispatchProps = Pick<Props, 'onSubmit' | 'onBack'>
export type OwnProps = Pick<Props, 'metadata' | 'onClose'>
export type MapDispatch = Dispatch<SaveCollectionRequestAction | OpenModalAction>
