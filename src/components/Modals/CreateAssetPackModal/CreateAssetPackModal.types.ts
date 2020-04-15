import { Dispatch } from 'redux'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { RawAssetPack, AssetPack } from 'modules/assetPack/types'
import { saveAssetPackRequest, SaveAssetPackRequestAction } from 'modules/assetPack/actions'
import { AssetPackState } from 'modules/assetPack/reducer'
import { Project } from 'modules/project/types'
import { loginRequest, LoginRequestAction } from 'modules/identity/actions'

export enum CreateAssetPackView {
  LOGIN,
  IMPORT,
  EDIT_ASSETS,
  EDIT_ASSET_PACK,
  PROGRESS,
  SUCCESS,
  EXIT
}

export type State = {
  view: CreateAssetPackView
  back: CreateAssetPackView
  assetPack: RawAssetPack
}

export type Props = ModalProps & {
  project: Project | null
  progress: AssetPackState['progress']
  error: AssetPackState['error']
  assetPacks: AssetPack[]
  ethAddress?: string
  isLoggedIn: boolean
  isLoading: boolean
  onCreateAssetPack: typeof saveAssetPackRequest
  onLogin: typeof loginRequest
}

export type MapStateProps = Pick<Props, 'project' | 'progress' | 'error' | 'assetPacks' | 'isLoggedIn' | 'isLoading' | 'ethAddress'>
export type MapDispatchProps = Pick<Props, 'onCreateAssetPack' | 'onLogin'>
export type MapDispatch = Dispatch<SaveAssetPackRequestAction | LoginRequestAction>
