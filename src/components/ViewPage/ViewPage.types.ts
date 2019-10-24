import { Dispatch } from 'redux'
import { match } from 'react-router'

import { Project } from 'modules/project/types'
import { loadPublicProjectRequest, LoadPublicProjectRequestAction } from 'modules/project/actions'
import { Scene } from 'modules/scene/types'
import { Profile } from 'modules/profile/types'
import { togglePreview, TogglePreviewAction } from 'modules/editor/actions'

export type Props = {
  match: match<{ projectId: string, type: 'public' | 'pool' }>
  projectId: string,
  type: 'public' | 'pool',
  currentProject: Project | null
  currentScene: Scene | null
  currentAuthor: Profile | null
  isPreviewing: boolean
  isFetching: boolean
  isLoggedIn: boolean
  isReady: boolean
  onLoadProject: typeof loadPublicProjectRequest
  onPreview: () => ReturnType<typeof togglePreview>
}

export type State = {}

export type MapStateProps = Pick<
  Props,
  'isPreviewing' | 'isFetching' | 'isLoggedIn' | 'isReady' | 'currentProject' | 'currentScene' | 'currentAuthor'
>
export type MapDispatchProps = Pick<Props, 'onLoadProject' | 'onPreview'>
export type MapDispatch = Dispatch<
  // | OpenModalAction
  | LoadPublicProjectRequestAction
  | TogglePreviewAction
>
