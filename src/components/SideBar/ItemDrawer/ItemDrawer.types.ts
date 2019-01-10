import { FullCategory } from 'modules/category/types'

export type Props = {
  isHorizontal?: boolean
  columnCount?: number
  categories: FullCategory[]
}

export type State = {
  isList: boolean
}
