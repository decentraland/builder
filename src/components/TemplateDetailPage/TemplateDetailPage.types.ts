import { Project } from 'modules/project/types'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { loadProjectSceneRequest } from 'modules/project/actions'
import { Scene } from 'modules/scene/types'

export type Props = {
  template: Project | null
  isLoading: boolean
  scene: Scene | null
  onOpenModal: ActionFunction<typeof openModal>
  onLoadTemplateScene: ActionFunction<typeof loadProjectSceneRequest>
}
