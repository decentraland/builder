import { action } from 'typesafe-actions'

export const INIT = 'Init'
export const init = (localIds: string[]) => action(INIT, { localIds })
export type InitAction = ReturnType<typeof init>

export const REQUEST = 'Request'
export const request = (id: string) => action(REQUEST, { id })
export type RequestAction = ReturnType<typeof request>

export const SUCCESS = 'Success'
export const success = (id: string) => action(SUCCESS, { id })
export type SuccessAction = ReturnType<typeof success>

export const FAILURE = 'Failure'
export const failure = (id: string, error: string) => action(FAILURE, { id, error })
export type FailureAction = ReturnType<typeof failure>

export const ADD_LOCAL = 'Add local'
export const addLocal = (id: string) => action(ADD_LOCAL, { id })
export type AddLocalAction = ReturnType<typeof addLocal>
