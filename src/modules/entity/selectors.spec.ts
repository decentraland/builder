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
          pointer1: true,
          pointer2: true,
          pointer3: true
        }
      })

      it('should return the missingEntities state', () => {
        const result = getMissingEntities(state as RootState)
        expect(result).toEqual({
          pointer1: true,
          pointer2: true,
          pointer3: true
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
})
