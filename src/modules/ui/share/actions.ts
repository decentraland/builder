import { action } from 'typesafe-actions'
import { ShareTarget } from './types'

export const SHARE_SCENE = 'Share'
export const shareScene = (target: ShareTarget) => action(SHARE_SCENE, { target })
export type ShareAction = ReturnType<typeof shareScene>
