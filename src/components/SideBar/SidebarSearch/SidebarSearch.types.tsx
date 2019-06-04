import { Dispatch } from 'redux'

import { searchAssets, SearchAssetsAction } from 'modules/ui/sidebar/actions'

export type Props = {
  search: string
  isDisabled: boolean
  onSearch: typeof searchAssets
  onResetScroll: () => void
}

export type State = {
  search: string
}

export type MapStateProps = Pick<Props, 'search' | 'isDisabled'>
export type MapDispatchProps = Pick<Props, 'onSearch'>
export type MapDispatch = Dispatch<SearchAssetsAction>
