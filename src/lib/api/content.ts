import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { ContentServiceScene } from 'modules/deployment/types'
import { Profile } from 'modules/profile/types'

export const CONTENT_SERVER_URL = env.get('REACT_APP_CONTENT_SERVER_URL', '')

export class ContentAPI extends BaseAPI {
  fetchScene = async (x: number, y: number) => {
    const req = await fetch(`${this.url}/entities/scene?pointer=${x},${y}`)
    const res = await req.json()
    return res as ContentServiceScene
  }

  fetchProfiles = async (address: string) => {
    const req = await fetch(`${this.url}/entities/profiles?pointer=${address}`)
    const res = await req.json()
    return res as Profile[]
  }
}

export const content = new ContentAPI(CONTENT_SERVER_URL)
