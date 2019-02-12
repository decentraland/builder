import { SyntheticEvent } from 'react'

export function preventDefault(fn: Function) {
  return function(event?: SyntheticEvent) {
    if (event) {
      event.preventDefault()
    }
    fn.call(null, event)
  }
}
