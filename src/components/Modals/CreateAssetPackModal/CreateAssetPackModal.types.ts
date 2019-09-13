import { Dispatch } from 'redux'
import { RawAssetPack } from 'modules/assetPack/types'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import { saveAssetPackRequest, SaveAssetPackRequestAction } from 'modules/assetPack/actions'

export enum CreateAssetPackStep {
  IMPORT,
  EDIT_ASSETS,
  EDIT_ASSET_PACK
}

export type State = {
  view: CreateAssetPackStep
  assetPack: RawAssetPack | null
}

export type Props = ModalProps & {
  onCreateAssetPack: typeof saveAssetPackRequest
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onCreateAssetPack'>
export type MapDispatch = Dispatch<SaveAssetPackRequestAction>
