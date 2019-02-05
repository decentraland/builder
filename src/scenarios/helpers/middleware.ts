import { EventEmitter } from 'events'
import { RootState } from 'modules/common/types'
import { Store, Middleware } from 'redux'

export const eventEmitter = new EventEmitter()

export const scenarioMiddleware = (_: Store<RootState>) => (next: Middleware) => (action: any) => {
  const res = next(action)
  eventEmitter.emit(action.type, action)
  return res
}
