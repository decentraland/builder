import * as React from 'react'

export type State = {
  timeout: ReturnType<typeof setTimeout> | null
  diff: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export type Props = React.Props<HTMLDivElement> & {
  until: Date
}

export enum Time {
  Millisecond = 1,
  Second = 1000,
  Minute = 1000 * 60,
  Hour = 1000 * 60 * 60,
  Day = 1000 * 60 * 60 * 24
}
