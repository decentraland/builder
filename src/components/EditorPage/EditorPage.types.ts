import { loadAssetPacksRequest } from 'modules/assetPack/actions'

export type Props = {
  onLoadAssetPacks: typeof loadAssetPacksRequest
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onLoadAssetPacks'>
