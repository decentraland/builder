import { FullCategory } from 'modules/category/types'

export type Props = {
  categories?: FullCategory[]
  isLoading?: boolean
}

export type MapStateProps = Pick<Props, 'categories' | 'isLoading'>
export type MapDispatchProps = {}
