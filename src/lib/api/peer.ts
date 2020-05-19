import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { ContentServiceScene } from 'modules/deployment/types'
import { Profile } from 'modules/profile/types'

export const PEER_URL = env.get('REACT_APP_PEER_URL', '')

export class PeerAPI extends BaseAPI {
  fetchScene = async (x: number, y: number) => {
    const req = await fetch(`${this.url}/content/entities/scene?pointer=${x},${y}`)
    const res = await req.json()
    return res as ContentServiceScene
  }

  fetchProfile = async (address: string) => {
    const req = await fetch(`${this.url}/lambdas/profile/${address}`)
    const res = await req.json()
    return res as Profile
  }
}

export const content = new PeerAPI(PEER_URL)
