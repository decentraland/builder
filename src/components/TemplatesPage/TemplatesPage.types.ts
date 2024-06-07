import { Dispatch } from 'redux'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Project } from 'modules/project/types'
import { loadTemplatesRequest, LoadTemplatesRequestAction } from 'modules/project/actions'

export type Props = {
  templates: ModelById<Project>
  onLoadTemplates: typeof loadTemplatesRequest
}

export type MapStateProps = Pick<Props, 'templates'>
export type MapDispatchProps = Pick<Props, 'onLoadTemplates'>

export type MapDispatch = Dispatch<LoadTemplatesRequestAction>
