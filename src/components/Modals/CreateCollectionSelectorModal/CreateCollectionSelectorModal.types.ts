import { Dispatch } from 'react'
import { OpenModalAction } from 'decentraland-dapps/dist/modules/modal'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

export type Props = ModalProps & {
  onCreateCollection: () => void
  onCreateThirdPartyCollection: () => void
}

export type MapDispatchProps = Pick<Props, 'onCreateCollection' | 'onCreateThirdPartyCollection'>
export type OwnProps = Pick<Props, 'metadata' | 'onClose' | 'name'>
export type MapDispatch = Dispatch<OpenModalAction>
