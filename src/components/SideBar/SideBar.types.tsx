import { Dispatch } from 'redux'

import { Category } from 'modules/ui/sidebar/types'

export type Props = {
  categories?: Category[]
  isLoading?: boolean
  hasScript?: boolean
}

export type MapStateProps = Pick<Props, 'categories' | 'isLoading' | 'hasScript'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
