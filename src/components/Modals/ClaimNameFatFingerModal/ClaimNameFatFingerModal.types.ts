import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { claimNameRequest, ClaimNameRequestAction } from 'modules/ens/actions'

export type Props = ModalProps & {
  address?: string
  onClaim: typeof claimNameRequest
}

export type State = {
  currentName: string
}

export type MapState = Pick<Props, 'address'>
export type MapDispatch = Dispatch<ClaimNameRequestAction>
export type MapDispatchProps = Pick<Props, 'onClaim'>
