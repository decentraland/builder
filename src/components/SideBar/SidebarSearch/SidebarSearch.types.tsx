import { Dispatch } from 'redux'

import { searchAssets, SearchAssetsAction, toggleScripts, ToggleScriptsAction } from 'modules/ui/sidebar/actions'

export type Props = {
  search: string
  scripts: boolean
  isDisabled: boolean
  onSearch: typeof searchAssets
  onToggleScripts: typeof toggleScripts
  onResetScroll: () => void
}

export type State = {
  search: string
}

export type MapStateProps = Pick<Props, 'search' | 'scripts' | 'isDisabled'>
export type MapDispatchProps = Pick<Props, 'onSearch' | 'onToggleScripts'>
export type MapDispatch = Dispatch<SearchAssetsAction | ToggleScriptsAction>
