import { action } from 'typesafe-actions'

export const SAVE_LAST_LOCATION = 'Save last location'
export const saveLastLocation = (location: string) => action(SAVE_LAST_LOCATION, { location })
export type SaveLastLocationAction = ReturnType<typeof saveLastLocation>
