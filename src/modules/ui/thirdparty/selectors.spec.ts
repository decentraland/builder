import { RootState } from 'modules/common/types'
import { UIState } from '../reducer'
import { INITIAL_STATE } from './reducer'
import { getApprovalFlowUpdateProgress, getPushChangesUpdateProgress } from './selectors'
import { ThirdPartyAction } from './types'

let state: RootState

beforeEach(() => {
  state = {
    ui: {
      thirdParty: { ...INITIAL_STATE, progress: { [ThirdPartyAction.APPROVE_COLLECTION]: 50, [ThirdPartyAction.PUSH_CHANGES]: 30 } }
    } as UIState
  } as RootState
})

describe('when getting the deploy upload progress', () => {
  it('should return the progress', () => {
    expect(getApprovalFlowUpdateProgress(state)).toEqual(state.ui.thirdParty.progress[ThirdPartyAction.APPROVE_COLLECTION])
  })
})

describe('when getting the push changes upload progress', () => {
  it('should return the progress', () => {
    expect(getPushChangesUpdateProgress(state)).toEqual(state.ui.thirdParty.progress[ThirdPartyAction.PUSH_CHANGES])
  })
})
