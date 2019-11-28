import { createSelector } from 'reselect'
import { Location } from 'history'
import { getLocation } from 'connected-react-router'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { RootState } from 'modules/common/types'
import { getUserProjects } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { SortBy } from './types'

export const PAGE_SIZE = 12

export const getState = (state: RootState) => state.ui.dashboard

export const didCreate = (state: RootState) => getState(state).didCreate

export const didSync = (state: RootState) => getState(state).didSync

export const didDismissSyncedToast = (state: RootState) => getState(state).didDismissSyncedToast

export const didDismissSignInToast = (state: RootState) => getState(state).didDismissSignInToast

export const getTotalPages = createSelector<RootState, DataByKey<Project>, number>(
  getUserProjects,
  projects => Math.max(Math.ceil(Object.keys(projects).length / PAGE_SIZE), 1)
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

export const getProjects = createSelector<RootState, number, SortBy, DataByKey<Project>, Project[]>(
  getPage,
  getSortBy,
  getUserProjects,
  (page, sortBy, projects) => {
    const limit = PAGE_SIZE
    const offset = (page - 1) * PAGE_SIZE
    return Object.values(projects)
      .sort((a, b) => {
        switch (sortBy) {
          case SortBy.NEWEST: {
            return +new Date(a.createdAt) > +new Date(b.createdAt) ? -1 : 1
          }
          case SortBy.NAME: {
            return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1
          }
          case SortBy.SIZE: {
            return a.layout.rows * a.layout.cols > b.layout.cols * b.layout.rows ? -1 : 1
          }
        }
      })
      .slice(offset, offset + limit)
  }
)
