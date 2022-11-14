import { Dispatch } from 'redux'
import { editLandRequest, EditLandRequestAction } from 'modules/land/actions'

export type Props = {
  onEdit: typeof editLandRequest
}

export type State = {
  name?: string
  description?: string
}

export type MapDispatchProps = Pick<Props, 'onEdit'>
export type MapDispatch = Dispatch<EditLandRequestAction>
