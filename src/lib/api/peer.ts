import { config } from 'config'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { ContentServiceScene } from 'modules/deployment/types'
import type { Avatar } from '@dcl/schemas/dist/platform/profile/avatar'

export const PEER_URL = config.get('PEER_URL', '')

export type ProfileMetadata = {
  avatars: Avatar[]
}

export type ProfileResponse = ProfileMetadata[]

export const getCatalystContentUrl = (hash = '') => `${PEER_URL}/content/contents/${hash}`

export const getCatalystProfiles = async (ids: string[]) => {
  const req = await fetch(`${PEER_URL}/lambdas/profiles`, {
    method: 'POST',
    body: JSON.stringify({ ids: ids })
  })
  const res: ProfileResponse = await req.json()

  return res.map(profile => profile.avatars).flat()
}
export class PeerAPI extends BaseAPI {
  fetchScene = async (x: number, y: number) => {
    const req = await fetch(`${this.url}/content/entities/scene?pointer=${x},${y}`)
    const res = await req.json()
    return res as ContentServiceScene
  }
}

export const content = new PeerAPI(PEER_URL)
