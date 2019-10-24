import { action } from 'typesafe-actions'
import { ShareTarget } from './types'

export const SHARE = 'Share'
export const share = (target: ShareTarget) => action(SHARE, { target })
export type ShareAction = ReturnType<typeof share>
