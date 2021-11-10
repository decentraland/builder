import { ChainId } from '@dcl/schemas'
import { buyThirdPartyItemTiersSuccess } from 'modules/tiers/actions'
import { ThirdPartyItemTier } from 'modules/tiers/types'
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
    thirdParty = { id: '1', name: 'a third party', description: 'some desc', managers: ['0x1', '0x2'], maxItems: '0', totalItems: '0' }
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

describe('when reducing the action that signals the success of the purchase of an item tier slots', () => {
  let thirdParty: ThirdParty
  let tier: ThirdPartyItemTier
  let initialState: ThirdPartyState

  beforeEach(() => {
    thirdParty = { id: '1', name: 'a third party', description: 'some desc', managers: ['0x1', '0x2'], maxItems: '0', totalItems: '0' }
    tier = { id: '2', value: '100', price: '100' }
    initialState = { ...INITIAL_STATE, data: { '1': thirdParty } }
  })

  it('should update the maximum amount of items that a third party can contain', () => {
    expect(thirdPartyReducer(initialState, buyThirdPartyItemTiersSuccess('aTxHash', ChainId.MATIC_MUMBAI, thirdParty, tier))).toStrictEqual(
      {
        ...initialState,
        data: {
          ...initialState.data,
          '1': {
            ...initialState.data['1'],
            maxItems: '100'
          }
        }
      }
    )
  })
})
