import { Dispatch } from 'redux'
import { RawAssetPack, FullAssetPack } from 'modules/assetPack/types'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { saveAssetPackRequest, SaveAssetPackRequestAction } from 'modules/assetPack/actions'
import { AssetPackState } from 'modules/assetPack/reducer'

export enum EditAssetPackView {
  IMPORT,
  EDIT_ASSETS,
  EDIT_ASSET_PACK,
  PROGRESS,
  SUCCESS
}

export type State = {
  view: EditAssetPackView
  assetPack: RawAssetPack | null
  editingAsset: string | null
}

export type Props = ModalProps & {
  progress: AssetPackState['progress']
  error: AssetPackState['error']
  onCreateAssetPack: typeof saveAssetPackRequest
  assetPack: FullAssetPack | undefined
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Pick<Props, 'progress' | 'error' | 'assetPack'>
export type MapDispatchProps = Pick<Props, 'onCreateAssetPack'>
export type MapDispatch = Dispatch<SaveAssetPackRequestAction>
