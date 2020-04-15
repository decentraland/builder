import { Profile } from './types'
import { CONTENT_SERVER_URL } from 'lib/api/content'

export const getName = (profile: Profile) => profile.metadata.avatars[0].name
export const getFace = (profile: Profile) => CONTENT_SERVER_URL + '/contents/' + profile.metadata.avatars[0].avatar.snapshots.face
