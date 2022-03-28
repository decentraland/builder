import { action } from 'typesafe-actions'
import { CollectionPageView } from './types'

export const SET_COLLECTION_PAGE_VIEW = 'Set collection page view'
export const setCollectionPageView = (view: CollectionPageView) => action(SET_COLLECTION_PAGE_VIEW, { view })
export type SetCollectionPageViewAction = ReturnType<typeof setCollectionPageView>
