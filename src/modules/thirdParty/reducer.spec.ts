import { ChainId } from '@dcl/schemas'
import {
  buyThirdPartyItemSlotSuccess,
  fetchThirdPartyItemSlotPriceFailure,
  fetchThirdPartyItemSlotPriceRequest,
  fetchThirdPartyItemSlotPriceSuccess
} from 'modules/thirdParty/actions'
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
    thirdParty = {
      id: '1',
      name: 'a third party',
      description: 'some desc',
      managers: ['0x1', '0x2'],
      maxItems: '0',
      totalItems: '0'
    }
  })

  it('should add the collections to the data, remove the action from loading and set the error to null', () => {
    const state: ThirdPartyState = {
      data: {},
      loading: [fetchThirdPartiesRequest()],
      error: 'Some Error',
      itemSlotPrice: 1
    }

    expect(thirdPartyReducer(state, fetchThirdPartiesSuccess([thirdParty]))).toStrictEqual({
      data: {
        [thirdParty.id]: thirdParty
      },
      loading: [],
      error: null,
      itemSlotPrice: 1
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

describe('when reducing the action that signals the success of the purchase of item slots', () => {
  let thirdParty: ThirdParty
  let initialState: ThirdPartyState

  beforeEach(() => {
    thirdParty = {
      id: '1',
      name: 'a third party',
      description: 'some desc',
      managers: ['0x1', '0x2'],
      maxItems: '0',
      totalItems: '0'
    }
    initialState = { ...INITIAL_STATE, data: { '1': thirdParty } }
  })

  it('should update the maximum amount of items that a third party can contain', () => {
    expect(thirdPartyReducer(initialState, buyThirdPartyItemSlotSuccess('aTxHash', ChainId.MATIC_MUMBAI, thirdParty, 100))).toStrictEqual({
      ...initialState,
      data: {
        ...initialState.data,
        '1': {
          ...initialState.data['1'],
          maxItems: '100'
        }
      }
    })
  })
})

describe('when an action of type FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_REQUEST is called', () => {
  it('should add a fetchThirdPartyItemSlotPriceRequest to the loading array', () => {
    expect(thirdPartyReducer(INITIAL_STATE, fetchThirdPartyItemSlotPriceRequest())).toStrictEqual({
      ...INITIAL_STATE,
      loading: [fetchThirdPartyItemSlotPriceRequest()]
    })
  })
})

describe('when an action of type FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_SUCCESS is called', () => {
  let mockedSlotPrice: number
  beforeEach(() => {
    mockedSlotPrice = 10
  })

  it('should add the slot price to the data, remove the action from loading and set the error to null', () => {
    const state: ThirdPartyState = {
      data: {},
      loading: [fetchThirdPartyItemSlotPriceRequest()],
      error: 'Some Error',
      itemSlotPrice: 1
    }

    expect(thirdPartyReducer(state, fetchThirdPartyItemSlotPriceSuccess(mockedSlotPrice))).toStrictEqual({
      data: {},
      loading: [],
      error: null,
      itemSlotPrice: mockedSlotPrice
    })
  })
})

describe('when an action of type FETCH_THIRD_PARTY_ITEM_SLOT_PRICE_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      thirdPartyReducer(
        { ...INITIAL_STATE, loading: [fetchThirdPartyItemSlotPriceRequest()] },
        fetchThirdPartyItemSlotPriceFailure('Some Error')
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})
