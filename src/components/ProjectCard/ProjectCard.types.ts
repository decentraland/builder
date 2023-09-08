import { Dispatch } from 'redux'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Deployment, DeploymentStatus } from 'modules/deployment/types'
import {
  deleteProject,
  DeleteProjectAction,
  duplicateProjectRequest,
  DuplicateProjectRequestAction,
  loadProjectSceneRequest,
  LoadProjectSceneRequestAction
} from 'modules/project/actions'
import { Project } from 'modules/project/types'
import { PreviewType } from 'modules/editor/types'
import { Scene } from 'modules/scene/types'

export type DefaultProps = {
  parcels: number
  items: number
}

export type Props = DefaultProps & {
  project: Project
  isUploading: boolean
  hasError: boolean
  deploymentStatus: DeploymentStatus
  deployments: Deployment[]
  type: PreviewType
  scene: Scene
  onClick?: (project: Project) => any
  onDeleteProject: typeof deleteProject
  onDuplicateProject: typeof duplicateProjectRequest
  onOpenModal: typeof openModal
  onLoadProjectScene: typeof loadProjectSceneRequest
}

export type OwnProps = Pick<Props, 'project'>

export type State = {
  isDeleting: boolean
}

export type MapStateProps = Pick<
  Props,
  'parcels' | 'items' | 'deploymentStatus' | 'deployments' | 'type' | 'isUploading' | 'hasError' | 'scene'
>
export type MapDispatchProps = Pick<Props, 'onDeleteProject' | 'onDuplicateProject' | 'onOpenModal' | 'onLoadProjectScene'>
export type MapDispatch = Dispatch<DeleteProjectAction | DuplicateProjectRequestAction | OpenModalAction | LoadProjectSceneRequestAction>
