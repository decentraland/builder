import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { config } from 'config'
import { ContributableDomain } from 'modules/ens/types'
import { Authorization } from './auth'

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
  blockedSince?: string
}

export enum WorldPermissionType {
  Unrestricted = 'unrestricted',
  SharedSecret = 'shared-secret',
  NFTOwnership = 'nft-ownership',
  AllowList = 'allow-list'
}

export type UnrestrictedPermissionSetting = {
  type: WorldPermissionType.Unrestricted
}

export type AllowListPermissionSetting = {
  type: WorldPermissionType.AllowList
  wallets: string[]
}

export type WorldPermissions = {
  deployment: AllowListPermissionSetting
  access: AllowListPermissionSetting | UnrestrictedPermissionSetting
  streaming: AllowListPermissionSetting
}

export type WorldPermissionsResponse = {
  permissions: WorldPermissions
}

export enum WorldPermissionNames {
  Deployment = 'deployment',
  Access = 'access',
  Streaming = 'streaming'
}

export class WorldsAPI extends BaseAPI {
  private authorization?: Authorization

  constructor(authorization?: Authorization) {
    super(WORLDS_CONTENT_SERVER)
    if (authorization) {
      this.authorization = authorization
    }
  }

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

  public getPermissions = async (worldName: string) => {
    const path = `/world/${worldName}/permissions`
    const result = await fetch(this.url + path)

    if (result.ok) {
      const json: WorldPermissionsResponse = await result.json()
      return json.permissions
    } else {
      return null
    }
  }

  public postPermissionType = async (
    worldName: string,
    worldPermissionNames: WorldPermissionNames,
    worldPermissionType: WorldPermissionType
  ) => {
    if (!this.authorization) {
      throw new Error('Unauthorized')
    }

    const path = `/world/${worldName}/permissions/${worldPermissionNames}`
    const headers = this.authorization.createAuthHeaders('post', path, { type: worldPermissionType })
    const result = await fetch(this.url + path, {
      method: 'POST',
      headers
    })

    return result.status === 204
  }

  public putPermissionType = async (worldName: string, worldPermissionNames: WorldPermissionNames, address: string) => {
    if (!this.authorization) {
      throw new Error('Unauthorized')
    }

    const path = `/world/${worldName}/permissions/${worldPermissionNames}/${address}`
    const headers = this.authorization.createAuthHeaders('put', path, {})
    const result = await fetch(this.url + path, {
      method: 'PUT',
      headers
    })
    return result.status === 204
  }

  public deletePermissionType = async (worldName: string, worldPermissionNames: WorldPermissionNames, address: string) => {
    if (!this.authorization) {
      throw new Error('Unauthorized')
    }

    const path = `/world/${worldName}/permissions/${worldPermissionNames}/${address}`
    const headers = this.authorization.createAuthHeaders('delete', path, {})
    const result = await fetch(this.url + path, {
      method: 'DELETE',
      headers
    })
    return result.status === 204
  }

  public fetchContributableDomains = async () => {
    if (!this.authorization) {
      throw new Error('Unauthorized')
    }

    const path = '/world/contribute'
    const headers = this.authorization.createAuthHeaders('get', path, {})
    const result = await fetch(this.url + path, {
      method: 'GET',
      headers
    })

    if (result.ok) {
      const json: { domains: ContributableDomain[] } = await result.json()
      return json.domains
    } else {
      throw new Error('Error while fetching contributable domains')
    }
  }
}
