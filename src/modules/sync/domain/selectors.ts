import { DomainState } from './types'

export const getLocalIds = (state: DomainState) => state.localIds
export const getLoadingIds = (state: DomainState) => state.loadingIds
export const getErrors = (state: DomainState) => state.errorsById
