import { Action } from 'typesafe-actions'

/* eslint-disable @typescript-eslint/ban-types */
export type InspectorState = {}

const INITIAL_STATE: InspectorState = {}

type InspectorReducerAction = Action

export function inspectorReducer(state = INITIAL_STATE, action: InspectorReducerAction) {
  switch (action.type) {
    default:
      return state
  }
}
