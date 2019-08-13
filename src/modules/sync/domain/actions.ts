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

export const CREATE = 'Create'
export const create = (id: string) => action(CREATE, { id })
export type CreateAction = ReturnType<typeof create>

export const REMOVE = 'Remove'
export const remove = (id: string) => action(REMOVE, { id })
export type RemoveAction = ReturnType<typeof remove>
