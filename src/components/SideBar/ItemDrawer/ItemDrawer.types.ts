import { GridProps } from 'decentraland-ui'
import { FullCategory } from 'modules/category/types'

export type Props = {
  isHorizontal?: boolean
  columnCount?: GridProps['columns']
  categories: FullCategory[]
}

export type State = {
  isList: boolean
}
