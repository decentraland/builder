import { Dispatch } from 'redux'
import { NavigateToAction } from 'decentraland-dapps/dist/modules/location/actions'

import { ProjectState } from 'modules/project/reducer'
import { createProjectFromTemplate, CreateProjectFromTemplateAction } from 'modules/project/actions'

export type DefaultProps = {
  projects: ProjectState['data']
}

export type Props = DefaultProps & {
  onCreateProject: typeof createProjectFromTemplate
}

export type MapStateProps = Pick<Props, 'projects'>
export type MapDispatchProps = Pick<Props, 'onCreateProject'>
export type MapDispatch = Dispatch<NavigateToAction | CreateProjectFromTemplateAction>
