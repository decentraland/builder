import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { History } from 'history'

import { translationReducer as translation } from 'decentraland-dapps/dist/modules/translation/reducer'
import { locationReducer as location } from 'decentraland-dapps/dist/modules/location/reducer'

import { RootState } from './types'

export function createRootReducer(history: History) {
  return combineReducers<RootState>({
    location,
    translation,
    router: connectRouter(history)
  })
}
