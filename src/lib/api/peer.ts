import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { ContentServiceScene } from 'modules/deployment/types'
import { Profile } from 'modules/profile/types'

export const PEER_URL = env.get('REACT_APP_PEER_URL', '')

export class PeerAPI extends BaseAPI {
  cache: Record<string, Promise<Profile>> = {}

  fetchScene = async (x: number, y: number) => {
    const req = await fetch(`${this.url}/content/entities/scene?pointer=${x},${y}`)
    const res = await req.json()
    return res as ContentServiceScene
  }

  fetchProfile = async (address: string) => {
    if (address in this.cache) {
      return this.cache[address]
    }
    const promise = fetch(`${this.url}/lambdas/profile/${address.toLowerCase()}`).then(res => res.json()) as Promise<Profile>
    this.cache[address] = promise
    return promise
  }
}

export const content = new PeerAPI(PEER_URL)
