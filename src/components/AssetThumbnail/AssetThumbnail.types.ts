import { Asset, RawAsset } from 'modules/asset/types'

export type DefaultProps = {
  error: boolean
}

export type Props = DefaultProps & {
  asset: Partial<RawAsset> & Pick<Asset, 'id' | 'name' | 'thumbnail'>
  onRemove: (id: string) => void
}
