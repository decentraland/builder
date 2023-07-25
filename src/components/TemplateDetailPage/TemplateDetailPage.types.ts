import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Project } from 'modules/project/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Scene } from 'modules/scene/types'
import { LoadProjectSceneRequestAction } from 'modules/project/actions'

export type Props = {
  template: Project | null
  isLoading: boolean
  scene: Scene | null
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onLoadTemplateScene: (project: Project) => void
}

export type MapStateProps = Pick<Props, 'template' | 'isLoading' | 'scene'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onLoadTemplateScene'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | OpenModalAction | LoadProjectSceneRequestAction>
