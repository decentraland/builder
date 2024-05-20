import { Authorization } from './auth'
import {
  AllowListPermissionSetting,
  UnrestrictedPermissionSetting,
  WorldPermissionNames,
  WorldPermissionType,
  WorldPermissions,
  WorldsAPI,
  WorldsWalletStats
} from './worlds'

const MockWorldsAPI = WorldsAPI as jest.MockedClass<typeof WorldsAPI>
let worldsApi: WorldsAPI

class AuthMock extends Authorization {
  constructor() {
    super(() => 'mockAddress')
  }
  createAuthHeaders = jest.fn().mockReturnValue({})
}

beforeEach(() => {
  global.fetch = jest.fn()
})

describe('when fetching the world stats for a wallet', () => {
  let wallet: string

  beforeEach(() => {
    wallet = '0x123'
    worldsApi = new MockWorldsAPI()
  })

  describe('when the fetch result is not ok', () => {
    beforeEach(() => {
      global.fetch = () => Promise.resolve({ ok: false } as Response)
    })

    it('should return null', async () => {
      expect(await worldsApi.fetchWalletStats(wallet)).toBeNull()
    })
  })

  describe('when the fetch result is ok', () => {
    let walletStats: WorldsWalletStats

    beforeEach(() => {
      walletStats = {
        wallet,
        dclNames: [],
        ensNames: [],
        maxAllowedSpace: '',
        usedSpace: ''
      }

      global.fetch = () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(walletStats)
        } as Response)
    })

    it('should return null', async () => {
      expect(await worldsApi.fetchWalletStats(wallet)).toBe(walletStats)
    })
  })
})

describe('when fetching the world permissions for a wallet', () => {
  const worldName: string = 'name.dcl.eth'

  beforeEach(() => {
    worldsApi = new MockWorldsAPI(new AuthMock())
  })

  describe('when the get permision result is ok', () => {
    let worldPermission: WorldPermissions

    beforeEach(() => {
      worldPermission = {
        deployment: {
          type: 'allow-list',
          wallets: []
        } as AllowListPermissionSetting,
        access: {
          type: 'unrestricted'
        } as UnrestrictedPermissionSetting,
        streaming: {
          type: 'allow-list',
          wallets: []
        } as AllowListPermissionSetting
      }
      global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ permissions: worldPermission }) } as Response)
    })

    it('should return an object with the permissions', async () => {
      expect(await worldsApi.getPermissions(worldName)).toEqual(worldPermission)
    })
  })

  describe('when the post permission deployment result is ok', () => {
    beforeEach(() => {
      global.fetch = () => Promise.resolve({ status: 204 } as Response)
    })

    it('should resolve to true', async () => {
      expect(await worldsApi.postPermissionType(worldName, WorldPermissionNames.Deployment, WorldPermissionType.AllowList)).toBe(true)
    })
  })

  describe('when putting the permission deployment for a specific user', () => {
    beforeEach(() => {
      global.fetch = () => Promise.resolve({ status: 204 } as Response)
    })

    it('should resolve to true', async () => {
      expect(await worldsApi.putPermissionType(worldName, WorldPermissionNames.Deployment, '0x456')).toBe(true)
    })
  })

  describe('when deleting the permission deployment for a specific user', () => {
    beforeEach(() => {
      global.fetch = () => Promise.resolve({ status: 204 } as Response)
    })

    it('should resolve to true', async () => {
      expect(await worldsApi.deletePermissionType(worldName, WorldPermissionNames.Deployment, '0x456')).toBe(true)
    })
  })
})

describe('when fetching contributable names for a wallet', () => {
  beforeEach(() => {
    worldsApi = new MockWorldsAPI(new AuthMock())
  })

  describe('when there is an error fetching the names', () => {
    beforeEach(() => {
      global.fetch = () => Promise.resolve({ ok: false } as Response)
    })

    it('should throw an error', async () => {
      await expect(worldsApi.fetchContributableDomains()).rejects.toThrow('Error while fetching contributable domains')
    })
  })

  describe('when the names could be fetched successfully', () => {
    beforeEach(() => {
      global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ domains: [] }) } as Response)
    })

    it('should return domains value', async () => {
      await expect(worldsApi.fetchContributableDomains()).resolves.toEqual([])
    })
  })
})
