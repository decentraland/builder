import { Dispatch } from 'redux'
import { match, RouteComponentProps } from 'react-router'
import { Profile } from 'decentraland-dapps/dist/modules/profile/types'

import { Project } from 'modules/project/types'
import { Pool } from 'modules/pool/types'
import { LoadProjectSceneRequestAction, loadPublicProjectRequest, LoadPublicProjectRequestAction } from 'modules/project/actions'
import { Scene } from 'modules/scene/types'
import { togglePreview, TogglePreviewAction, closeEditor, CloseEditorAction } from 'modules/editor/actions'
import { likePoolRequest, LikePoolRequestAction } from 'modules/pool/actions'
import { openModal, OpenModalAction } from 'decentraland-dapps/dist/modules/modal/actions'
import { PreviewType } from 'modules/editor/types'

export type Props = {
  match: match<{ projectId: string; type: PreviewType.PUBLIC | PreviewType.POOL }>
  projectId: string
  type: PreviewType.PUBLIC | PreviewType.POOL
  currentProject: Project | null
  currentPool: Pool | null
  scenes: Record<string, Scene>
  currentAuthor: Profile | null
  isPreviewing: boolean
  isFetching: boolean
  isLoggedIn: boolean
  isReady: boolean
  isLoading: boolean
  onCloseEditor: typeof closeEditor
  onLoadProject: typeof loadPublicProjectRequest
  onPreview: () => ReturnType<typeof togglePreview>
  onLikePool: typeof likePoolRequest
  onOpenModal: typeof openModal
  onLoadProjectScene: (project: Project, type: PreviewType.POOL | PreviewType.PUBLIC) => void
} & RouteComponentProps

export type MapStateProps = Pick<
  Props,
  'isPreviewing' | 'isFetching' | 'isLoggedIn' | 'isReady' | 'isLoading' | 'currentProject' | 'currentPool' | 'scenes' | 'currentAuthor'
>
export type MapDispatchProps = Pick<
  Props,
  'onLoadProject' | 'onPreview' | 'onLikePool' | 'onOpenModal' | 'onCloseEditor' | 'onLoadProjectScene'
>
export type MapDispatch = Dispatch<
  | LoadPublicProjectRequestAction
  | TogglePreviewAction
  | LikePoolRequestAction
  | OpenModalAction
  | CloseEditorAction
  | LoadProjectSceneRequestAction
>
