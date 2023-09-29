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

export type WorldsWalletStats = {
  wallet: string
  dclNames: {
    name: string
    size: string
  }[]
  ensNames: {
    name: string
    size: string
  }[]
  usedSpace: string
  maxAllowedSpace: string
}

export class WorldsAPI extends BaseAPI {
  public async fetchWorld(name: string) {
    const result = await fetch(`${this.url}/world/${name}/about`)
    if (result.ok) {
      const json = await result.json()
      return json as WorldInfo
    } else {
      return null
    }
  }

  public fetchWalletStats = async (address: string) => {
    const result = await fetch(`${this.url}/wallet/${address}/stats`)
    if (result.ok) {
      const json = await result.json()
      return json as WorldsWalletStats
    } else {
      return null
    }
  }
}

export const content = new WorldsAPI(WORLDS_CONTENT_SERVER)
