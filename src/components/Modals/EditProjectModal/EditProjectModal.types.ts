import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

import { editProject, EditProjectAction } from 'modules/project/actions'
import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { SetGroundAction } from 'modules/scene/actions'

export type Props = ModalProps & {
  currentProject: Project | null
  currentScene: Scene | null
  onSave: typeof editProject
}

export type State = {
  title: string
  description: string
}

export type MapStateProps = Pick<Props, 'currentProject' | 'currentScene'>
export type MapDispatchProps = Pick<Props, 'onSave'>
export type MapDispatch = Dispatch<EditProjectAction> & Dispatch<SetGroundAction>
