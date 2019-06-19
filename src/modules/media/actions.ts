import { action } from 'typesafe-actions'
import { Media } from './types'

// Record media

export const RECORD_MEDIA_REQUEST = '[Request] Record media'
export const recordMediaRequest = (cid: string | null) => action(RECORD_MEDIA_REQUEST, { cid })
export type RecordMediaRequestAction = ReturnType<typeof recordMediaRequest>

export const RECORD_MEDIA_SUCCESS = '[Success] Record media'
export const recordMediaSuccess = (media: Media) => action(RECORD_MEDIA_SUCCESS, { media })
export type RecordMediaSuccessAction = ReturnType<typeof recordMediaSuccess>

export const RECORD_MEDIA_PROGRESS = '[Progress] Record media'
export const recordMediaProgress = (progress: number) => action(RECORD_MEDIA_PROGRESS, { progress })
export type RecordMediaProgressAction = ReturnType<typeof recordMediaProgress>
