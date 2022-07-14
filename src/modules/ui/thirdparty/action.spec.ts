import { THIRD_PARTY_ACTION_UPDATE_PROGRESS, updateThirdPartyActionProgress } from './action'
import { ThirdPartyAction } from './types'

describe('when creating the action to update the progress of the deploy of the multiple items to the catalyst', () => {
  it('should return an action signaling the update of the progress', () => {
    expect(updateThirdPartyActionProgress(20, ThirdPartyAction.APPROVE_COLLECTION)).toEqual({
      type: THIRD_PARTY_ACTION_UPDATE_PROGRESS,
      payload: {
        progress: 20,
        action: ThirdPartyAction.APPROVE_COLLECTION
      }
    })
  })
})

describe('when creating the action to update the progress of pushing changes of a collection', () => {
  it('should return an action signaling the update of the progress', () => {
    expect(updateThirdPartyActionProgress(20, ThirdPartyAction.PUSH_CHANGES)).toEqual({
      type: THIRD_PARTY_ACTION_UPDATE_PROGRESS,
      payload: {
        progress: 20,
        action: ThirdPartyAction.PUSH_CHANGES
      }
    })
  })
})
