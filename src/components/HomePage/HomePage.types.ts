import { Dispatch } from 'redux'
import { navigateTo, NavigateToAction } from 'decentraland-dapps/dist/modules/location/actions'

import { ProjectState } from 'modules/project/reducer'

export type Props = {
  projects: ProjectState['data']
  onProjectClick: typeof navigateTo
}

export type MapStateProps = Pick<Props, 'projects'>
export type MapDispatchProps = Pick<Props, 'onProjectClick'>
export type MapDispatch = Dispatch<NavigateToAction>
