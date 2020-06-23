import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { OccupiedAtlasParcel } from 'modules/deployment/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'

export type Props = {
  occupiedParcels: Record<string, OccupiedAtlasParcel>
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
}

export type State = {
  hovered: string | null
}

export type MapStateProps = Pick<Props, 'occupiedParcels'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction>
