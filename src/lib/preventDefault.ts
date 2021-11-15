import { SyntheticEvent } from 'react'

export function preventDefault(fn?: Function) {
  return function(event?: SyntheticEvent | Event, ...args: any[]) {
    if (event) {
      event.preventDefault()
    }
    if (fn) {
      fn.call(null, event, ...args)
    }
  }
}
