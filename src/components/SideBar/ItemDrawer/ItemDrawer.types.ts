import { GridProps } from 'decentraland-ui'
import { Category } from 'modules/ui/sidebar/types'
import { Asset } from 'modules/asset/types'
import { searchAssets } from 'modules/ui/sidebar/actions'

export type DefaultProps = {
  columnCount: GridProps['columns']
  onClick: (asset: Asset) => any
}

export type Props = DefaultProps & {
  isHorizontal?: boolean
  categories: Category[]
  onSearch: typeof searchAssets
}

export type State = {
  isList: boolean
  isSearching: boolean
}
