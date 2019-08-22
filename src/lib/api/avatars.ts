import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { User } from 'modules/auth/types'
import { authorize } from './auth'

export const AVATARS_API_URL = env.get('REACT_APP_AVATARS_API_URL', '')

export class AvatarsAPI extends BaseAPI {
  fetchUser = async (accessToken?: string) => {
    const user: User = await this.request('get', `/profile`, null, authorize(accessToken))
    return user
  }
}

export const avatars = new AvatarsAPI(AVATARS_API_URL)
