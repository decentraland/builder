import { WorldsWalletStats } from 'lib/api/worlds'
import { BLOCK_DELAY_IN_MILLISECONDS, DCLWorldsStatus, fromBytesToMegabytes, getDCLWorldsStatus } from './utils'

describe('when converting from bytes to megabytes', () => {
  describe('when the number is 10000000', () => {
    it('should return 9.5367431640625', () => {
      expect(fromBytesToMegabytes(10000000)).toBe(9.5367431640625)
    })
  })
})

describe('when getting the dcl worlds status', () => {
  let stats: WorldsWalletStats

  beforeEach(() => {
    stats = {
      usedSpace: '0',
      maxAllowedSpace: '0'
    } as WorldsWalletStats
  })

  describe('when the used space is lower than the max allowed space', () => {
    beforeEach(() => {
      stats.usedSpace = '100'
      stats.maxAllowedSpace = '101'
    })

    it('should return status ok', () => {
      expect(getDCLWorldsStatus(stats)).toEqual({ status: DCLWorldsStatus.OK })
    })
  })

  describe('when the used space is equal to the max allowed space', () => {
    beforeEach(() => {
      stats.usedSpace = '100'
      stats.maxAllowedSpace = '100'
    })

    it('should return status ok', () => {
      expect(getDCLWorldsStatus(stats)).toEqual({ status: DCLWorldsStatus.OK })
    })
  })

  describe('when the used space is greater to the max allowed space', () => {
    beforeEach(() => {
      stats.usedSpace = '101'
      stats.maxAllowedSpace = '100'
    })

    describe('and blocked since is not defined', () => {
      beforeEach(() => {
        stats.blockedSince = undefined
      })

      it('should return status ok', () => {
        expect(getDCLWorldsStatus(stats)).toEqual({ status: DCLWorldsStatus.OK })
      })
    })

    describe('and blocked since is defined as 1 day later than now', () => {
      beforeEach(() => {
        stats.blockedSince = new Date(Date.now() + 24 * 60 * 60 * 1000 /* 1 day */).toISOString()
      })

      it('should return status ok', () => {
        expect(getDCLWorldsStatus(stats)).toEqual({ status: DCLWorldsStatus.OK })
      })
    })

    describe('and blocked since is defined as 1 day earlier than now', () => {
      beforeEach(() => {
        stats.blockedSince = new Date(Date.now() - 24 * 60 * 60 * 1000 /* 1 day */).toISOString()
      })

      it('should return status to be blocked with the to be blocked date', () => {
        expect(getDCLWorldsStatus(stats)).toEqual({
          status: DCLWorldsStatus.TO_BE_BLOCKED,
          toBeBlockedAt: new Date(new Date(stats.blockedSince!).getTime() + BLOCK_DELAY_IN_MILLISECONDS)
        })
      })
    })

    describe('and blocked since is defined as 3 days earlier than now', () => {
      beforeEach(() => {
        stats.blockedSince = new Date(Date.now() - 72 * 60 * 60 * 1000 /* 3 days */).toISOString()
      })

      it('should return status to be blocked with the to be blocked date', () => {
        expect(getDCLWorldsStatus(stats)).toEqual({
          status: DCLWorldsStatus.BLOCKED,
          blockedAt: new Date(new Date(stats.blockedSince!).getTime() + BLOCK_DELAY_IN_MILLISECONDS)
        })
      })
    })
  })
})
