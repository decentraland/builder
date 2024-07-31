import { ContractNetwork, Mapping, Mappings, MappingType } from '@dcl/schemas'
import { areMappingsEqual, areMappingsValid } from './utils'

describe('when checking if some mappings are valid', () => {
  let mappings: Mappings

  describe('and the mappings are valid', () => {
    beforeEach(() => {
      mappings = {
        [ContractNetwork.AMOY]: {
          '0x74c78f5A4ab22F01d5fd08455cf0Ff5C3367535C': [
            {
              type: MappingType.SINGLE,
              id: '123'
            }
          ]
        }
      }
    })

    it('should return true', () => {
      expect(areMappingsValid(mappings)).toBe(true)
    })
  })

  describe('and the mapping is not valid', () => {
    beforeEach(() => {
      mappings = {
        [ContractNetwork.AMOY]: {
          '0x74': [
            {
              type: MappingType.SINGLE,
              id: '123'
            }
          ]
        }
      }
    })

    it('should return false', () => {
      expect(areMappingsValid(mappings)).toBe(false)
    })
  })
})

describe('when checking if two mappings are equal', () => {
  let fstMapping: Mapping
  let sndMapping: Mapping

  describe('and the type is different', () => {
    beforeEach(() => {
      fstMapping = {
        type: MappingType.ANY
      }
      sndMapping = {
        type: MappingType.SINGLE,
        id: '123'
      }
    })

    it('should return false', () => {
      expect(areMappingsEqual(fstMapping, sndMapping)).toBe(false)
    })
  })

  describe('and both mappings are of type ANY', () => {
    beforeEach(() => {
      fstMapping = {
        type: MappingType.ANY
      }
      sndMapping = {
        type: MappingType.ANY
      }
    })

    it('should return true', () => {
      expect(areMappingsEqual(fstMapping, sndMapping)).toBe(true)
    })
  })

  describe('and both mappings are of type SINGLE', () => {
    describe('and the ids are different', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.SINGLE,
          id: '123'
        }
        sndMapping = {
          type: MappingType.SINGLE,
          id: '456'
        }
      })

      it('should return false', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(false)
      })
    })

    describe('and the ids are equal', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.SINGLE,
          id: '123'
        }
        sndMapping = {
          type: MappingType.SINGLE,
          id: '123'
        }
      })

      it('should return true', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(true)
      })
    })
  })

  describe('and bot mappings are of type RANGE', () => {
    describe('and the from property is different', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.RANGE,
          from: '123',
          to: '456'
        }
        sndMapping = {
          type: MappingType.RANGE,
          from: '456',
          to: '456'
        }
      })

      it('should return false', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(false)
      })
    })

    describe('and the to property is different', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.RANGE,
          from: '123',
          to: '456'
        }
        sndMapping = {
          type: MappingType.RANGE,
          from: '123',
          to: '789'
        }
      })

      it('should return false', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(false)
      })
    })

    describe('and the ranges are equal', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.RANGE,
          from: '123',
          to: '456'
        }
        sndMapping = {
          type: MappingType.RANGE,
          from: '123',
          to: '456'
        }
      })

      it('should return true', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(true)
      })
    })
  })

  describe('and both mappings are of type MULTIPLE', () => {
    describe('and the ids are different', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.MULTIPLE,
          ids: ['123', '456']
        }
        sndMapping = {
          type: MappingType.MULTIPLE,
          ids: ['456', '123']
        }
      })

      it('should return false', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(false)
      })
    })

    describe('and the ids are equal', () => {
      beforeEach(() => {
        fstMapping = {
          type: MappingType.MULTIPLE,
          ids: ['123', '456']
        }
        sndMapping = {
          type: MappingType.MULTIPLE,
          ids: ['123', '456']
        }
      })

      it('should return true', () => {
        expect(areMappingsEqual(fstMapping, sndMapping)).toBe(true)
      })
    })
  })
})
