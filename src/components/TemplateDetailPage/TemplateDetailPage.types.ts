import { Dispatch } from 'redux'
import { Project } from 'modules/project/types'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { Scene } from 'modules/scene/types'
import { LoadProjectSceneRequestAction } from 'modules/project/actions'

export type Props = {
  template: Project | null
  isLoading: boolean
  scene: Scene | null
  onOpenModal: typeof openModal
  onLoadTemplateScene: (project: Project) => void
}

export type MapStateProps = Pick<Props, 'template' | 'isLoading' | 'scene'>
export type MapDispatchProps = Pick<Props, 'onOpenModal' | 'onLoadTemplateScene'>
export type MapDispatch = Dispatch<OpenModalAction | LoadProjectSceneRequestAction>
