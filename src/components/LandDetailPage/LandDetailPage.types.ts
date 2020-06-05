import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { OccupiedAtlasParcel } from 'modules/deployment/types'

export type Props = {
  occupiedParcels: Record<string, OccupiedAtlasParcel>
  onNavigate: (path: string) => void
}

export type State = {
  hovered: string | null
}

export type MapStateProps = Pick<Props, 'occupiedParcels'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
