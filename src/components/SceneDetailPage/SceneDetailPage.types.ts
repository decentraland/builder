import { Dispatch } from 'redux'
import { Project } from 'modules/project/types'
import { Deployment } from 'modules/deployment/types'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
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
  scene: Scene | null
  onOpenModal: typeof openModal
  onDelete: typeof deleteProject
  onDuplicate: typeof duplicateProjectRequest
  onLoadProjectScene: typeof loadProjectSceneRequest
}

export type MapStateProps = Pick<Props, 'project' | 'deployments' | 'isLoading' | 'isLoadingDeployments' | 'scene'>
export type MapDispatchProps = Pick<Props, 'onDelete' | 'onDuplicate' | 'onOpenModal' | 'onLoadProjectScene'>
export type MapDispatch = Dispatch<DeleteProjectAction | DuplicateProjectRequestAction | OpenModalAction | LoadProjectSceneRequestAction>
