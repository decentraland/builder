import { SyntheticEvent } from 'react'

export function preventDefault(fn?: Function) {
  return function(event?: SyntheticEvent | Event) {
    if (event) {
      event.preventDefault()
    }
    if (fn) {
      fn.call(null, event)
    }
  }
}
