import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'

import { editProject, EditProjectAction } from 'modules/project/actions'
import { Project } from 'modules/project/types'
import { Scene } from 'modules/scene/types'
import { Asset } from 'modules/asset/types'
import { ModelById } from 'decentraland-dapps/dist/lib/types'
import { setGround, SetGroundAction } from 'modules/scene/actions'

export type Props = ModalProps & {
  currentProject: Project | null
  currentScene: Scene | null
  grounds: ModelById<Asset>
  onSave: typeof editProject
  onSetGround: typeof setGround
}

export type State = {
  title: string
  description: string
  selectedGround: string | null
}

export type MapStateProps = Pick<Props, 'currentProject' | 'currentScene' | 'grounds'>
export type MapDispatchProps = Pick<Props, 'onSave' | 'onSetGround'>
export type MapDispatch = Dispatch<EditProjectAction> & Dispatch<SetGroundAction>
