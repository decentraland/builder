import { Dispatch } from 'redux'

import { AssetPack } from 'modules/assetPack/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { selectAssetPack, SelectAssetPackAction } from 'modules/ui/sidebar/actions'

export type Props = {
  assetPacks: AssetPack[]
  onSelectAssetPack: typeof selectAssetPack
  onOpenModal: typeof openModal
}

export type MapStateProps = Pick<Props, 'assetPacks'>
export type MapDispatchProps = Pick<Props, 'onSelectAssetPack' | 'onOpenModal'>
export type MapDispatch = Dispatch<SelectAssetPackAction | OpenModalAction>
