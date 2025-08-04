import { Project } from 'modules/project/types'
import { deleteProject, duplicateProjectRequest, loadProjectSceneRequest } from 'modules/project/actions'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { Deployment } from 'modules/deployment/types'
import { Scene } from 'modules/scene/types'

export type Props = {
  project: Project | null
  deployments: Deployment[]
  isLoading: boolean
  isLoadingDeployments: boolean
  scene: Scene | null
  onOpenModal: ActionFunction<typeof openModal>
  onDelete: ActionFunction<typeof deleteProject>
  onDuplicate: ActionFunction<typeof duplicateProjectRequest>
  onLoadProjectScene: ActionFunction<typeof loadProjectSceneRequest>
}
