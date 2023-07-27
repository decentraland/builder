import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Project } from 'modules/project/types'
import { Deployment } from 'modules/deployment/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import {
  deleteProject,
  duplicateProjectRequest,
  DeleteProjectAction,
  DuplicateProjectRequestAction,
  loadProjectSceneRequest,
  LoadProjectSceneRequestAction
} from 'modules/project/actions'
import { Scene } from 'modules/scene/types'

export type Props = {
  project: Project | null
  deployments: Deployment[]
  isLoading: boolean
  isLoadingDeployments: boolean
  isInspectorEnabled: boolean
  scene: Scene | null
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onDelete: typeof deleteProject
  onDuplicate: typeof duplicateProjectRequest
  onLoadProjectScene: typeof loadProjectSceneRequest
}

export type MapStateProps = Pick<Props, 'project' | 'deployments' | 'isLoading' | 'isLoadingDeployments' | 'isInspectorEnabled' | 'scene'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onDelete' | 'onDuplicate' | 'onOpenModal' | 'onLoadProjectScene'>
export type MapDispatch = Dispatch<
  CallHistoryMethodAction | DeleteProjectAction | DuplicateProjectRequestAction | OpenModalAction | LoadProjectSceneRequestAction
>
