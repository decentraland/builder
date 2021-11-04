import { fetchThirdPartiesRequest, fetchThirdPartiesSuccess, fetchThirdPartiesFailure } from './actions'
import { INITIAL_STATE, thirdPartyReducer, ThirdPartyState } from './reducer'
import { ThirdParty } from './types'

describe('when an action of type FETCH_THIRD_PARTIES_REQUEST is called', () => {
  it('should add a fetchThirdPartiesRequest to the loading array', () => {
    expect(thirdPartyReducer(INITIAL_STATE, fetchThirdPartiesRequest())).toStrictEqual({
      ...INITIAL_STATE,
      loading: [fetchThirdPartiesRequest()]
    })
  })
})

describe('when an action of type FETCH_THIRD_PARTIES_SUCCESS is called', () => {
  let thirdParty: ThirdParty
  beforeEach(() => {
    thirdParty = { id: '1', name: 'a third party', description: 'some desc', managers: ['0x1', '0x2'] }
  })

  it('should add the collections to the data, remove the action from loading and set the error to null', () => {
    const state: ThirdPartyState = {
      data: {},
      loading: [fetchThirdPartiesRequest()],
      error: 'Some Error'
    }

    expect(thirdPartyReducer(state, fetchThirdPartiesSuccess([thirdParty]))).toStrictEqual({
      data: {
        [thirdParty.id]: thirdParty
      },
      loading: [],
      error: null
    })
  })
})

describe('when an action of type FETCH_THIRD_PARTIES_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      thirdPartyReducer({ ...INITIAL_STATE, loading: [fetchThirdPartiesRequest()] }, fetchThirdPartiesFailure('Some Error'))
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})
