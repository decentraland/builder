import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { config } from 'config'

export const WORLDS_CONTENT_SERVER = config.get('WORLDS_CONTENT_SERVER', '')

export type WorldInfo = {
  healthy: boolean
  configurations: {
    networkId: number
    globalScenesUrn: string[]
    scenesUrn: string[]
    cityLoaderContentServer: string
  }
  content: {
    healthy: boolean
    publicUrl: string
  }
  lambdas: {
    healthy: boolean
    publicUrl: string
  }
}

export class WorldsAPI extends BaseAPI {
  public async fetchWorld(name: string) {
    const req = await fetch(`${this.url}/world/${name}/about`)
    if (req.ok) {
      const res = await req.json()
      return res as WorldInfo
    } else {
      return null
    }
  }
}

export const content = new WorldsAPI(WORLDS_CONTENT_SERVER)
