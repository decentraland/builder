import { transferLandRequest, TransferLandRequestAction } from 'modules/land/actions'
import { Dispatch } from 'redux'

export type Props = {
  onTransfer: typeof transferLandRequest
}

export type State = {
  address: string
  isValid: boolean
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onTransfer'>
export type MapDispatch = Dispatch<TransferLandRequestAction>
