import { Dispatch } from 'redux'
import { navigateTo, NavigateToAction } from 'decentraland-dapps/dist/modules/location/actions'

export type Props = {
  stackTrace: string
  onNavigate: typeof navigateTo
}

export type OwnProps = Pick<Props, 'stackTrace'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<NavigateToAction>
