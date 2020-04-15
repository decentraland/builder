import { Dispatch } from 'redux'
import { match } from 'react-router'

import { Project } from 'modules/project/types'
import { Pool } from 'modules/pool/types'
import { loadPublicProjectRequest, LoadPublicProjectRequestAction } from 'modules/project/actions'
import { Scene } from 'modules/scene/types'
import { Profile } from 'modules/profile/types'
import { togglePreview, TogglePreviewAction, closeEditor, CloseEditorAction } from 'modules/editor/actions'
import { likePoolRequest, LikePoolRequestAction } from 'modules/pool/actions'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { CallHistoryMethodAction } from 'connected-react-router'

export type Props = {
  match: match<{ projectId: string; type: 'public' | 'pool' }>
  projectId: string
  type: 'public' | 'pool'
  currentProject: Project | null
  currentPool: Pool | null
  currentScene: Scene | null
  currentAuthor: Profile | null
  isPreviewing: boolean
  isFetching: boolean
  isLoggedIn: boolean
  isReady: boolean
  onCloseEditor: typeof closeEditor
  onLoadProject: typeof loadPublicProjectRequest
  onPreview: () => ReturnType<typeof togglePreview>
  onLikePool: typeof likePoolRequest
  onOpenModal: typeof openModal
  onBack: () => void
}

export type State = {}

export type MapStateProps = Pick<
  Props,
  'isPreviewing' | 'isFetching' | 'isLoggedIn' | 'isReady' | 'currentProject' | 'currentPool' | 'currentScene' | 'currentAuthor'
>
export type MapDispatchProps = Pick<Props, 'onLoadProject' | 'onPreview' | 'onLikePool' | 'onOpenModal' | 'onCloseEditor' | 'onBack'>
export type MapDispatch = Dispatch<
  | LoadPublicProjectRequestAction
  | TogglePreviewAction
  | LikePoolRequestAction
  | OpenModalAction
  | CloseEditorAction
  | CallHistoryMethodAction
>
