import { GridProps } from 'decentraland-ui'
import { Category } from 'modules/ui/sidebar/types'
import { Asset } from 'modules/asset/types'

export type Props = {
  isHorizontal?: boolean
  columnCount: GridProps['columns']
  categories: Category[]
  onClick: (asset: Asset) => any
}

export type State = {
  isList: boolean
}
