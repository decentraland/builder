import { action } from 'typesafe-actions'
import { ThirdPartyAction } from './types'

// Update TP Action progress
export const THIRD_PARTY_ACTION_UPDATE_PROGRESS = '[Update progress] Third Party Action'

export const updateThirdPartyActionProgress = (progress: number, tpAction: ThirdPartyAction) =>
  action(THIRD_PARTY_ACTION_UPDATE_PROGRESS, { progress, action: tpAction })

export type UpdateThirdPartyProgressAction = ReturnType<typeof updateThirdPartyActionProgress>
