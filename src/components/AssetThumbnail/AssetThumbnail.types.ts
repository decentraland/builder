import { Asset, RawAsset } from 'modules/asset/types'

export type DefaultProps = {
  error: boolean
}

export type Props = DefaultProps & {
  asset: RawAsset | Asset
  onRemove: (id: string) => void
}
