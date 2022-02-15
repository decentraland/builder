import { action } from 'typesafe-actions'

export const SAVE_MULTIPLE_ITEMS_UPDATE_PROGRESS = '[Update progress] Save Multiple Items'

export const updateProgressSaveMultipleItems = (progress: number) => action(SAVE_MULTIPLE_ITEMS_UPDATE_PROGRESS, { progress })

export type UpdateProgressSaveMultipleItemsAction = ReturnType<typeof updateProgressSaveMultipleItems>
