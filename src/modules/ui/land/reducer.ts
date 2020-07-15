import { LandPageView } from './types'
import { SetLandPageViewAction, SET_LAND_PAGE_VIEW } from './actions'

export type LandState = {
  view: LandPageView
}

export const INITIAL_STATE: LandState = {
  view: LandPageView.GRID
}

type LandReducerAction = SetLandPageViewAction

export function landReducer(state = INITIAL_STATE, action: LandReducerAction) {
  switch (action.type) {
    case SET_LAND_PAGE_VIEW: {
      return {
        ...state,
        view: action.payload.view
      }
    }
    default:
      return state
  }
}
