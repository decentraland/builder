import { Dispatch } from 'redux'

import { AssetPack } from 'modules/assetPack/types'
import { selectAssetPack, SelectAssetPackAction } from 'modules/ui/sidebar/actions'

export type Props = {
  assetPacks: AssetPack[]
  onSelectAssetPack: typeof selectAssetPack
}

export type MapStateProps = Pick<Props, 'assetPacks'>
export type MapDispatchProps = Pick<Props, 'onSelectAssetPack'>
export type MapDispatch = Dispatch<SelectAssetPackAction>
