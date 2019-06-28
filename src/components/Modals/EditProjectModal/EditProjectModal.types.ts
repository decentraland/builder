import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { editProjectRequest, EditProjectRequestAction } from 'modules/project/actions'
import { DeploymentStatus } from 'modules/deployment/types'

export type Props = ModalProps & {
  currentProject: Project
  currentScene: Scene
  deploymentStatus: DeploymentStatus
  onSave: typeof editProjectRequest
}

export type State = {
  title: string
  description: string
  cols: number
  rows: number
  hasError: boolean
}

export type MapStateProps = Pick<Props, 'currentProject' | 'currentScene' | 'deploymentStatus'>
export type MapDispatchProps = Pick<Props, 'onSave'>
export type MapDispatch = Dispatch<EditProjectRequestAction>
