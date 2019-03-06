import { Dispatch } from 'redux'
import { navigateTo, NavigateToAction } from 'decentraland-dapps/dist/modules/location/actions'

export type Props = {
  onNavigate: typeof navigateTo
}

export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<NavigateToAction>
