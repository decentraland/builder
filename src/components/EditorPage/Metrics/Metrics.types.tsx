import { Dispatch } from 'redux'

import { ModelMetrics } from 'modules/models/types'

export type Props = {
  rows: number
  cols: number
  parcels: number
  metrics: ModelMetrics
  limits: ModelMetrics
}

export type State = {
  isBubbleVisible: boolean
}

export type MapStateProps = Props
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
