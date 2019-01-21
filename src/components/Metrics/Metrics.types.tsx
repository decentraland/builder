import { Dispatch } from 'redux'

import { SceneMetrics } from 'modules/scene/types'

export type Props = {
  parcels: number
  metrics: SceneMetrics
  limits: SceneMetrics
}

export type State = {
  toggle: boolean
}

export type MapStateProps = Props
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
