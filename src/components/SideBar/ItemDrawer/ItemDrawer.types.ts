import { GridProps } from 'decentraland-ui'
import { FullCategory } from 'modules/category/types'
import { Asset } from 'modules/asset/types'

export type Props = {
  isHorizontal?: boolean
  columnCount: GridProps['columns']
  categories: FullCategory[]
  onClick: (asset: Asset) => any
}

export type State = {
  isList: boolean
}
