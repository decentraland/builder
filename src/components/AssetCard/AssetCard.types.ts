import { Asset } from 'modules/asset/types'

export type DefaultProps = {
  onClick: (asset: Asset) => any
  onBeginDrag: (asset: Asset) => any
}

export type Props = DefaultProps & {
  isHorizontal?: boolean
  isDragging?: boolean
  asset: Asset
}
