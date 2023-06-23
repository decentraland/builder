import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { Project } from 'modules/project/types'
import { loadTemplatesRequest, LoadTemplatesRequestAction } from 'modules/project/actions'

export type Props = {
  templates: ModelById<Project>
  onLoadTemplates: typeof loadTemplatesRequest
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'templates'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onLoadTemplates'>

export type MapDispatch = Dispatch<CallHistoryMethodAction | LoadTemplatesRequestAction>
