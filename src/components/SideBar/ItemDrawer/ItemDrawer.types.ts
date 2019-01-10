import { Asset } from 'modules/asset/types'

export type Props = {
  isHorizontal?: boolean
  assets: Asset[]
}

export type State = {
  isList: boolean
}
