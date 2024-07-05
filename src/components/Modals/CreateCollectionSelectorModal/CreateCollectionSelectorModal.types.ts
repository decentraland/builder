import { Dispatch } from 'react'
import { OpenModalAction } from 'decentraland-dapps/dist/modules/modal'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {
  isThirdPartyManager: boolean
  isLoadingThirdParties: boolean
  onCreateCollection: () => void
  onCreateLinkedWearablesCollection: () => void
}

export type MapStateProps = Pick<Props, 'isThirdPartyManager' | 'isLoadingThirdParties'>
export type MapDispatchProps = Pick<Props, 'onCreateCollection' | 'onCreateLinkedWearablesCollection'>
export type OwnProps = Pick<Props, 'metadata' | 'onClose' | 'name'>
export type MapDispatch = Dispatch<OpenModalAction>
