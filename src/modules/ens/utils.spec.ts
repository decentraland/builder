import { ethers } from 'ethers'
import { config } from 'config'
import { WorldInfo, WorldsAPI } from 'lib/api/worlds'
import { extractEntityId } from 'lib/urn'
import { Land, LandType } from 'modules/land/types'
import { ENS } from './types'
import { addWorldStatusToEachENS, encodeLandRedirect, getRedirectedLandId, isExternalName } from './utils'

function toRedirectContent(url: string) {
  return ethers.utils.hexConcat(['0x3000f2', ethers.utils.toUtf8Bytes(url)])
}

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

        jest.spyOn(WorldsAPI.prototype, 'fetchWorld').mockResolvedValue(response)
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

        jest.spyOn(WorldsAPI.prototype, 'fetchWorld').mockResolvedValue(response)
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

describe('when encoding the redirect of a LAND', () => {
  let land: Land

  describe('and the LAND is a parcel', () => {
    beforeEach(() => {
      land = { id: '15,2', type: LandType.PARCEL, x: 15, y: 2 } as Land
    })

    it('should return the redirect protocode followed by the jump URL of the parcel', () => {
      expect(encodeLandRedirect(land)).toBe(toRedirectContent(`${config.get('JUMP_URL')}?position=15,2`))
    })
  })

  describe('and the LAND is an estate whose center is one of its parcels', () => {
    beforeEach(() => {
      land = {
        id: '1',
        type: LandType.ESTATE,
        parcels: [
          { x: 10, y: 20, id: '10,20' },
          { x: 11, y: 20, id: '11,20' },
          { x: 12, y: 20, id: '12,20' }
        ]
      } as Land
    })

    it('should jump to the center of the estate', () => {
      expect(encodeLandRedirect(land)).toBe(toRedirectContent(`${config.get('JUMP_URL')}?position=11,20`))
    })
  })

  describe('and the LAND is an estate whose center is outside of it', () => {
    beforeEach(() => {
      land = {
        id: '1',
        type: LandType.ESTATE,
        parcels: [
          { x: 0, y: 0, id: '0,0' },
          { x: 1, y: 0, id: '1,0' },
          { x: 2, y: 0, id: '2,0' },
          { x: 2, y: 1, id: '2,1' },
          { x: 2, y: 2, id: '2,2' }
        ]
      } as Land
    })

    it('should jump to the first parcel of the estate', () => {
      expect(encodeLandRedirect(land)).toBe(toRedirectContent(`${config.get('JUMP_URL')}?position=0,0`))
    })
  })
})

describe('when getting the LAND a content hash redirects to', () => {
  let lands: Land[]
  let content: string

  beforeEach(() => {
    lands = [
      { id: '15,2', type: LandType.PARCEL, x: 15, y: 2 } as Land,
      {
        id: '1',
        type: LandType.ESTATE,
        parcels: [
          { x: 10, y: 20, id: '10,20' },
          { x: 11, y: 20, id: '11,20' }
        ]
      } as Land
    ]
  })

  describe('and the content redirects to a parcel of an estate', () => {
    beforeEach(() => {
      content = toRedirectContent(`${config.get('JUMP_URL')}?position=11,20`)
    })

    it('should return the id of the estate', () => {
      expect(getRedirectedLandId(content, lands)).toBe('1')
    })
  })

  describe('and the content redirects to a parcel', () => {
    beforeEach(() => {
      content = toRedirectContent(`${config.get('JUMP_URL')}/?position=15,2`)
    })

    it('should return the id of the parcel', () => {
      expect(getRedirectedLandId(content, lands)).toBe('15,2')
    })
  })

  describe('and the content redirects to a parcel that is not in the list', () => {
    beforeEach(() => {
      content = toRedirectContent(`${config.get('JUMP_URL')}?position=0,0`)
    })

    it('should return undefined', () => {
      expect(getRedirectedLandId(content, lands)).toBeUndefined()
    })
  })

  describe('and the content redirects to a parcel of an estate on another site', () => {
    beforeEach(() => {
      content = toRedirectContent('https://example.com/jump?position=11,20')
    })

    it('should return undefined', () => {
      expect(getRedirectedLandId(content, lands)).toBeUndefined()
    })
  })

  describe('and the content redirects to a parcel of an estate on another path of the jump site', () => {
    beforeEach(() => {
      content = toRedirectContent(`${new URL(config.get('JUMP_URL')).origin}/other?position=11,20`)
    })

    it('should return undefined', () => {
      expect(getRedirectedLandId(content, lands)).toBeUndefined()
    })
  })

  describe('and the content is not a redirect', () => {
    beforeEach(() => {
      content = '0xe30101701220' + '00'.repeat(32)
    })

    it('should return undefined', () => {
      expect(getRedirectedLandId(content, lands)).toBeUndefined()
    })
  })

  describe('and the content is a redirect without a valid URL', () => {
    beforeEach(() => {
      content = toRedirectContent('not a url')
    })

    it('should return undefined', () => {
      expect(getRedirectedLandId(content, lands)).toBeUndefined()
    })
  })
})
