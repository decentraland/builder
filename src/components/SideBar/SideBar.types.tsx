import { Dispatch } from 'redux'

import { Category } from 'modules/ui/sidebar/types'

export type Props = {
  categories?: Category[]
  isLoading?: boolean
}

export type MapStateProps = Pick<Props, 'categories' | 'isLoading'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
