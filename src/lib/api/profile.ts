import { env } from 'decentraland-commons'
import { User, RemoteUser } from 'modules/auth/types'
import { authorize } from './auth'

export const PROFILE_API_URL = env.get('REACT_APP_PROFILE_API_URL', '')

export class ProfileAPI {
  constructor(public url: string) { }

  async request(method: string, path: string, params: any | null = null, options: RequestInit) {
    const res = await fetch(this.getUrl(path), {
      method,
      ...options,
      body: params
    })

    if (!res.ok) {
      throw new Error(`Status: ${res.status} - ${res.statusText}`)
    }

    return res.json()
  }

  getUrl(path: string) {
    return `${this.url}${path}`
  }

  fetchUser = async (userId: string, accessToken?: string): Promise<User> => {
    const user: RemoteUser = await this.request('get', `/profile/${userId}`, null, authorize(accessToken))
    const createdAt = new Date(Date.parse(user.createdAt))
    const updatedAt = new Date(Date.parse(user.updatedAt))
    return { ...user, id: userId, createdAt, updatedAt }
  }

  fetchProfileById = async (userId: string): Promise<User | null> => {
    try {
      return this.fetchUser(userId)
    } catch (e) {
      return null
    }
  }
}

export const profile = new ProfileAPI(PROFILE_API_URL)
