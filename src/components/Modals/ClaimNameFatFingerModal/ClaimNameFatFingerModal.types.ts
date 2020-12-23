import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { claimNameRequest } from 'modules/ens/actions'

export type Props = ModalProps & {
  isLoading: boolean
  address?: string
  metadata: {
    originalName: string
  }
  onClaim: typeof claimNameRequest
  onNavigate: (path: string) => void
}

export type State = {
  currentName: string
}

export type MapState = Pick<Props, 'address'>
export type MapDispatch = Dispatch
export type MapDispatchProps = Pick<Props, 'onClaim' | 'onNavigate'>
