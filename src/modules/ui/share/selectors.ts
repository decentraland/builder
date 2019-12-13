import { createSelector } from 'reselect'
import { getLocation } from 'connected-react-router'
import { RootState } from 'modules/common/types'

export const isInteractive = createSelector(
  (state: RootState) => getLocation(state),
  (location) => {
    const params = new URLSearchParams(location.search)
    return !params.has('interactive') || ['0', 'false'].includes(params.get('interactive') || 'true')
  }
)
