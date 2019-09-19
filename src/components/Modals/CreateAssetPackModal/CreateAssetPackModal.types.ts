import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { RawAssetPack } from 'modules/assetPack/types'
import { LoginAction, login } from 'modules/auth/actions'
import { saveAssetPackRequest, SaveAssetPackRequestAction } from 'modules/assetPack/actions'
import { AssetPackState } from 'modules/assetPack/reducer'
import { Project } from 'modules/project/types'

export enum CreateAssetPackView {
  LOGIN,
  IMPORT,
  EDIT_ASSETS,
  EDIT_ASSET_PACK,
  PROGRESS,
  SUCCESS
}

export type State = {
  view: CreateAssetPackView
  assetPack: RawAssetPack | null
}

export type Props = ModalProps & {
  project: Project | null
  progress: AssetPackState['progress']
  error: AssetPackState['error']
  isLoggedIn: boolean
  onCreateAssetPack: typeof saveAssetPackRequest
  onLogin: typeof login
}

export type MapStateProps = Pick<Props, 'project' | 'progress' | 'error' | 'isLoggedIn'>
export type MapDispatchProps = Pick<Props, 'onCreateAssetPack' | 'onLogin'>
export type MapDispatch = Dispatch<SaveAssetPackRequestAction | LoginAction>
