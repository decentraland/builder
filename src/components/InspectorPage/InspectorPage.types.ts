import { Dispatch } from 'redux'
import { Scene } from 'modules/scene/types'
import { Project } from 'modules/project/types'
import { connectInspector, ConnectInspectorAction, openInspector, OpenInspectorAction } from 'modules/inspector/actions'

export type Props = {
  scene: Scene | null
  address?: string
  project?: Project | null
  isLoggedIn: boolean
  isReloading: boolean
  onOpen: typeof openInspector
  onConnect: typeof connectInspector
}

export type State = {
  isLoaded: boolean
}

export type MapStateProps = Pick<Props, 'isLoggedIn' | 'scene' | 'project' | 'isReloading' | 'address'>
export type MapDispatchProps = Pick<Props, 'onOpen' | 'onConnect'>
export type MapDispatch = Dispatch<OpenInspectorAction | ConnectInspectorAction>
