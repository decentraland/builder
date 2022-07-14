import { updateThirdPartyActionProgress } from './action'
import { ThirdPartyReducer, INITIAL_STATE } from './reducer'
import { ThirdPartyAction } from './types'

describe('when starting the reducer', () => {
  it('should return the initial state', () => {
    expect(ThirdPartyReducer(undefined, {} as any)).toEqual(INITIAL_STATE)
  })
})

describe('when reducing the action that updates the progress of the upload to the catalyst', () => {
  it('should return an state with the progress being updated', () => {
    expect(ThirdPartyReducer(INITIAL_STATE, updateThirdPartyActionProgress(50, ThirdPartyAction.APPROVE_COLLECTION))).toEqual({
      ...INITIAL_STATE,
      progress: {
        [ThirdPartyAction.APPROVE_COLLECTION]: 50,
        [ThirdPartyAction.PUSH_CHANGES]: 0
      }
    })
  })
})

describe('when reducing the action that updates the progress of pushing changes of a collection', () => {
  it('should return an state with the progress being updated', () => {
    expect(ThirdPartyReducer(INITIAL_STATE, updateThirdPartyActionProgress(50, ThirdPartyAction.PUSH_CHANGES))).toEqual({
      ...INITIAL_STATE,
      progress: {
        [ThirdPartyAction.APPROVE_COLLECTION]: 0,
        [ThirdPartyAction.PUSH_CHANGES]: 50
      }
    })
  })
})
