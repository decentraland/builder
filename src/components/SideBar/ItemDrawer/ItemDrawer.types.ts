import { GridProps } from 'decentraland-ui'
import { Category } from 'modules/ui/sidebar/types'
import { Asset } from 'modules/asset/types'
import { searchAssets } from 'modules/ui/sidebar/actions'

export type Props = {
  isHorizontal?: boolean
  columnCount: GridProps['columns']
  categories: Category[]
  onClick: (asset: Asset) => any
  onSearch: typeof searchAssets
}

export type State = {
  isList: boolean
}
