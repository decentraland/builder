import { action } from 'typesafe-actions'

export const INIT = 'Init'
export const init = (localIds: string[]) => action(INIT, { localIds })
export type InitAction = ReturnType<typeof init>

export const REMOVE = 'Remove'
export const remove = (id: string) => action(REMOVE, { id })
export type RemoveAction = ReturnType<typeof remove>
