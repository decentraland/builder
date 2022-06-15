import { config } from 'config'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { ContentServiceScene } from 'modules/deployment/types'

export const PEER_URL = config.get('PEER_URL', '')

export const getCatalystContentUrl = (hash: string = '') => `${PEER_URL}/content/contents/${hash}`

export class PeerAPI extends BaseAPI {
  fetchScene = async (x: number, y: number) => {
    const req = await fetch(`${this.url}/content/entities/scene?pointer=${x},${y}`)
    const res = await req.json()
    return res as ContentServiceScene
  }
}

export const content = new PeerAPI(PEER_URL)
