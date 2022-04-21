import { CollectionPageView } from './types'
import { SetCollectionPageViewAction, SET_COLLECTION_PAGE_VIEW } from './actions'

export type CollectionState = {
  view: CollectionPageView
}

export const INITIAL_STATE: CollectionState = {
  view: CollectionPageView.GRID
}

type CollectionReducerAction = SetCollectionPageViewAction

export function collectionReducer(state = INITIAL_STATE, action: CollectionReducerAction) {
  switch (action.type) {
    case SET_COLLECTION_PAGE_VIEW: {
      return {
        ...state,
        view: action.payload.view
      }
    }
    default:
      return state
  }
}
