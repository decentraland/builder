import { SyntheticEvent } from 'react'

// check if eventMethod is a callable property of event
export type EventMethod<T extends SyntheticEvent | Event> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T]

function executeFn(eventMethod: EventMethod<SyntheticEvent | Event>) {
  return function (fn?: (event?: SyntheticEvent | Event, ...args: any[]) => void) {
    return function (event?: SyntheticEvent | Event, ...args: any[]) {
      if (event) {
        event[eventMethod]()
      }

      if (fn) {
        fn(event, ...args)
      }
    }
  }
}

export const preventDefault = (fn?: (event?: SyntheticEvent | Event, ...args: any[]) => void) => executeFn('preventDefault')(fn)
export const stopPropagation = (fn?: (event?: SyntheticEvent | Event, ...args: any[]) => void) => executeFn('stopPropagation')(fn)
