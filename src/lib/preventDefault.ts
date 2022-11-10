import { SyntheticEvent } from 'react'

export function preventDefault(fn?: (event?: SyntheticEvent | Event, ...args: any[]) => void) {
  return function (event?: SyntheticEvent | Event, ...args: any[]) {
    if (event) {
      event.preventDefault()
    }
    if (fn) {
      fn(event, ...args)
    }
  }
}
