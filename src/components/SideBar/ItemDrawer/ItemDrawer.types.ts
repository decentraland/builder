import { AssetDescriptor } from 'modules/assetPack/types'

export type Props = {
  isHorizontal?: boolean
  assets: AssetDescriptor[]
}

export type State = {
  isList: boolean
}
