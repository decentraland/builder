import { EntityType } from '@dcl/schemas'
import { getMissingEntities } from './selectors'
import { RootState } from 'modules/common/types'

describe('Entity selectors', () => {
  let state: Partial<RootState>

  beforeEach(() => {
    // Start with empty state
    state = {
      entity: {
        data: {},
        loading: [],
        error: null,
        missingEntities: {}
      }
    } as Partial<RootState>
  })

  describe('getMissingEntities', () => {
    describe('when pointers do not have deployed entities', () => {
      beforeEach(() => {
        state.entity!.missingEntities = {
          [EntityType.WEARABLE]: ['pointer1', 'pointer2'],
          [EntityType.SCENE]: ['pointer3']
        }
      })

      it('should return the missingEntities state', () => {
        const result = getMissingEntities(state as RootState)
        expect(result).toEqual({
          [EntityType.WEARABLE]: ['pointer1', 'pointer2'],
          [EntityType.SCENE]: ['pointer3']
        })
      })
    })

    describe('when there are no missing entities', () => {
      it('should return an empty object', () => {
        const result = getMissingEntities(state as RootState)
        expect(result).toEqual({})
      })
    })
  })

  describe('getMissingEntitiesByType', () => {
    // Create selector for testing
    const getMissingEntitiesByType = (type: EntityType) => (rootState: RootState) => {
      const missingEntities = getMissingEntities(rootState)
      return missingEntities[type] || []
    }

    describe('when there are missing entities of the requested type', () => {
      beforeEach(() => {
        state.entity!.missingEntities = {
          [EntityType.WEARABLE]: ['pointer1', 'pointer2'],
          [EntityType.SCENE]: ['pointer3']
        }
      })

      it('should return the missing entities for the specific type', () => {
        const result = getMissingEntitiesByType(EntityType.WEARABLE)(state as RootState)
        expect(result).toEqual(['pointer1', 'pointer2'])
      })
    })

    describe('when there are no missing entities of the requested type', () => {
      beforeEach(() => {
        state.entity!.missingEntities = {
          [EntityType.SCENE]: ['pointer3']
        }
      })

      it('should return an empty array', () => {
        const result = getMissingEntitiesByType(EntityType.EMOTE)(state as RootState)
        expect(result).toEqual([])
      })
    })

    describe('when there are no missing entities at all', () => {
      it('should return an empty array', () => {
        const result = getMissingEntitiesByType(EntityType.WEARABLE)(state as RootState)
        expect(result).toEqual([])
      })
    })
  })

  describe('hasMissingEntitiesForPointer', () => {
    // Create selector for testing
    const hasMissingEntitiesForPointer = (pointer: string) => (rootState: RootState) => {
      const missingEntities = getMissingEntities(rootState)
      return Object.values(missingEntities).some(pointers => pointers.includes(pointer))
    }

    describe('when the pointer exists in missing entities', () => {
      beforeEach(() => {
        state.entity!.missingEntities = {
          [EntityType.WEARABLE]: ['pointer1', 'pointer2'],
          [EntityType.SCENE]: ['pointer3']
        }
      })

      it('should return true', () => {
        const result = hasMissingEntitiesForPointer('pointer1')(state as RootState)
        expect(result).toBe(true)
      })
    })

    describe('when the pointer does not exist in missing entities', () => {
      beforeEach(() => {
        state.entity!.missingEntities = {
          [EntityType.WEARABLE]: ['pointer1', 'pointer2'],
          [EntityType.SCENE]: ['pointer3']
        }
      })

      it('should return false', () => {
        const result = hasMissingEntitiesForPointer('pointer4')(state as RootState)
        expect(result).toBe(false)
      })
    })

    describe('when there are no missing entities', () => {
      it('should return false', () => {
        const result = hasMissingEntitiesForPointer('pointer1')(state as RootState)
        expect(result).toBe(false)
      })
    })
  })
})
