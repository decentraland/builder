import { Dispatch } from 'redux'
import { Scene } from 'modules/scene/types'
import { openInspector, OpenInspectorAction } from 'modules/inspector/actions'

export type Props = {
  scene: Scene | null
  isLoggedIn: boolean
  onOpen: typeof openInspector
}

export type MapStateProps = Pick<Props, 'isLoggedIn' | 'scene'>
// eslint-disable-next-line @typescript-eslint/ban-types
export type MapDispatchProps = Pick<Props, 'onOpen'>
export type MapDispatch = Dispatch<OpenInspectorAction>
