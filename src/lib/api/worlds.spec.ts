import { WorldsWalletStats, content } from './worlds'

beforeEach(() => {
  global.fetch = jest.fn()
})

describe('when fetching the world stats for a wallet', () => {
  let wallet: string

  beforeEach(() => {
    wallet = '0x123'
  })

  describe('when the fetch result is not ok', () => {
    beforeEach(() => {
      global.fetch = () => Promise.resolve({ ok: false } as Response)
    })

    it('should return null', async () => {
      expect(await content.fetchWalletStats(wallet)).toBeNull()
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
      expect(await content.fetchWalletStats(wallet)).toBe(walletStats)
    })
  })
})
