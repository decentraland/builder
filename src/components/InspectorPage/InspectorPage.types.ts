import { Dispatch } from 'redux'
import { Scene } from 'modules/scene/types'
import { connectInspector, ConnectInspectorAction, openInspector, OpenInspectorAction } from 'modules/inspector/actions'

export type Props = {
  scene: Scene | null
  isLoggedIn: boolean
  onOpen: typeof openInspector
  onConnect: typeof connectInspector
}

export type State = {
  isLoaded: boolean
}

export type MapStateProps = Pick<Props, 'isLoggedIn' | 'scene'>
// eslint-disable-next-line @typescript-eslint/ban-types
export type MapDispatchProps = Pick<Props, 'onOpen' | 'onConnect'>
export type MapDispatch = Dispatch<OpenInspectorAction | ConnectInspectorAction>
