import { AnyAction } from 'redux'

export type Race<T extends AnyAction, K extends AnyAction> = {
  success: T
  failure: K
}
