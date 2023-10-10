import { WorldInfo, content } from 'lib/api/worlds'
import { extractEntityId } from 'lib/urn'
import { ENS } from './types'
import { addWorldStatusToEachENS, isExternalName } from './utils'

describe('when checking if a subdomain is an external subdomain', () => {
  let subdomain: string

  describe('when providing a dcl subdomain', () => {
    beforeEach(() => {
      subdomain = 'name.dcl.eth'
    })

    it('should return false', () => {
      expect(isExternalName(subdomain)).toBe(false)
    })
  })

  describe('when providing a non dcl subdomain', () => {
    beforeEach(() => {
      subdomain = 'name.eth'
    })

    it('should return true', () => {
      expect(isExternalName(subdomain)).toBe(true)
    })
  })

  describe('when providing a non dcl subdomain that ends with dcl', () => {
    beforeEach(() => {
      subdomain = 'name-dcl.eth'
    })

    it('should return true', () => {
      expect(isExternalName(subdomain)).toBe(true)
    })
  })
})

describe('when adding the world status to each ens', () => {
  let enss: ENS[]

  describe('when providing a list of enss', () => {
    let response: WorldInfo | null

    beforeEach(() => {
      enss = [
        {
          subdomain: 'name.dcl.eth'
        }
      ] as ENS[]
    })

    describe('when the fetch world request returns null', () => {
      beforeEach(() => {
        response = null

        jest.spyOn(content, 'fetchWorld').mockResolvedValue(response)
      })

      it('should return the enss with the world status set to null', async () => {
        expect(await addWorldStatusToEachENS(enss)).toEqual([{ ...enss[0], worldStatus: null }])
      })
    })

    describe('when the fetch world request returns the world info', () => {
      beforeEach(() => {
        response = {
          healthy: true,
          configurations: {
            scenesUrn: [
              'urn:decentraland:entity:bafkreiavjamezigndx7rq5ggwd3tg3c5hzrnvla5euukqs25ew2hs4gtte?=&baseUrl=https://worlds-content-server.decentraland.zone/contents/'
            ]
          }
        } as WorldInfo

        jest.spyOn(content, 'fetchWorld').mockResolvedValue(response)
      })

      it('should return the enss with the world status set', async () => {
        const healthy = response!.healthy
        const urn = response!.configurations.scenesUrn[0]

        expect(await addWorldStatusToEachENS(enss)).toEqual([
          {
            ...enss[0],
            worldStatus: {
              healthy,
              scene: {
                urn,
                entityId: extractEntityId(urn)
              }
            }
          }
        ])
      })
    })
  })
})
