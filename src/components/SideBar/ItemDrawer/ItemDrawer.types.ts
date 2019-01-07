import { AssetDescriptor } from 'modules/assetpack/types'

export type Props = {
  isHorizontal?: boolean
  assets: AssetDescriptor[]
}

export type State = {
  isList: boolean
}
