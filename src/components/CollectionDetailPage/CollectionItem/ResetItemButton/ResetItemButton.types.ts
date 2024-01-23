import { Dispatch } from 'redux'
import { OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'

export type Props = {
  itemId: string
  isEnabled: boolean
  onClick: () => void
}

export type MapStateProps = Pick<Props, 'isEnabled'>
export type MapDispatchProps = Pick<Props, 'onClick'>
export type MapDispatch = Dispatch<OpenModalAction>
export type OwnProps = Pick<Props, 'itemId'>
