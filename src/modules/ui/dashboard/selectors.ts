import { createSelector } from 'reselect'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'
import { RootState } from 'modules/common/types'
import { getUserProjects } from 'modules/project/selectors'
import { Project } from 'modules/project/types'
import { getPageFromSearchParams, getSortByFromSearchParams } from 'modules/location/url-parsers'
import { SortBy } from './types'

export const PAGE_SIZE = 12

export const getState = (state: RootState) => state.ui.dashboard

export const didCreate = (state: RootState) => getState(state).didCreate

export const didSync = (state: RootState) => getState(state).didSync

export const didDismissSyncedToast = (state: RootState) => getState(state).didDismissSyncedToast

export const didDismissSignInToast = (state: RootState) => getState(state).didDismissSignInToast

export const getTotalPages = createSelector<RootState, DataByKey<Project>, number>(getUserProjects, projects =>
  Math.max(Math.ceil(Object.keys(projects).length / PAGE_SIZE), 1)
)

export const getProjects = (state: RootState, search: string) => {
  const totalPages = getTotalPages(state)
  const projects = getUserProjects(state)
  const page = getPageFromSearchParams(search, totalPages)
  const sortBy = getSortByFromSearchParams(search, Object.values(SortBy), SortBy.NEWEST)
  const limit = PAGE_SIZE
  const offset = (page - 1) * PAGE_SIZE
  return Object.values(projects)
    .sort((a, b) => {
      switch (sortBy) {
        case SortBy.NAME:
          return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1
        case SortBy.SIZE:
          return a.layout.rows * a.layout.cols > b.layout.cols * b.layout.rows ? -1 : 1
        case SortBy.NEWEST:
        default:
          return +new Date(a.createdAt) > +new Date(b.createdAt) ? -1 : 1
      }
    })
    .slice(offset, offset + limit)
}

export const didMigrate = (state: RootState) => getState(state).didMigrate
export const needsMigration = (state: RootState) => getState(state).needsMigration
