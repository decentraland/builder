import { createSelector } from 'reselect'
import { Location } from 'history'
import { getLocation } from 'connected-react-router'
import { RootState } from 'modules/common/types'
import { SortBy } from './types'
import { getENSByWallet } from 'modules/ens/selectors'
import { ENS } from 'modules/ens/types'

export const PAGE_SIZE = 12

export const getTotalPages = createSelector<RootState, ENS[], number>(
  state => getENSByWallet(state),
  ensList => Math.ceil(ensList.length / PAGE_SIZE)
)

export const getPage = createSelector<RootState, Location, number, number>(
  state => getLocation<RootState>(state),
  getTotalPages,
  (location, totalPages) => {
    const params = new URLSearchParams(location.search)
    let page = parseInt(params.get('page')!, 10)
    if (!page || page < 1) {
      page = 1
    }
    if (page > totalPages) {
      page = totalPages
    }
    return page
  }
)

export const getSortBy = createSelector<RootState, Location, SortBy>(
  state => getLocation<RootState>(state),
  location => {
    const params = new URLSearchParams(location.search)
    let sortBy: SortBy = SortBy.NEWEST
    for (const upperCaseType of Object.keys(SortBy)) {
      let paramType = params.get('sort_by')
      if (paramType) {
        paramType = paramType.toLowerCase()
        const type = upperCaseType.toLowerCase()
        if (paramType === type) {
          sortBy = type as SortBy
        }
      }
    }
    return sortBy
  }
)
