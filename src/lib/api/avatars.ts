import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { authorize } from './auth'
import { User } from 'modules/auth/types'

export const AVATARS_API_URL = env.get('REACT_APP_AVATARS_API_URL', '')

export class AvatarsAPI extends BaseAPI {
  fetchUser = async () => {
    const user: User = await this.request('get', `/profile`, null, authorize())
    return user
  }
}

export const avatars = new AvatarsAPI(AVATARS_API_URL)
