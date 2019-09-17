import { Dispatch } from 'redux'
import { RawAssetPack } from 'modules/assetPack/types'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { saveAssetPackRequest, SaveAssetPackRequestAction } from 'modules/assetPack/actions'
import { AssetPackState } from 'modules/assetPack/reducer'

export enum CreateAssetPackView {
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
  progress: AssetPackState['progress']
  error: AssetPackState['error']
  onCreateAssetPack: typeof saveAssetPackRequest
}

export type MapStateProps = Pick<Props, 'progress' | 'error'>
export type MapDispatchProps = Pick<Props, 'onCreateAssetPack'>
export type MapDispatch = Dispatch<SaveAssetPackRequestAction>
