import { ChainId } from '@dcl/schemas'
import { fetchTransactionSuccess } from 'decentraland-dapps/dist/modules/transaction/actions'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'
import { getTransactionFromAction } from 'decentraland-dapps/dist/modules/transaction/utils'
import { Collection } from 'modules/collection/types'
import { publishThirdPartyItemsSuccess } from 'modules/item/actions'
import { Item } from 'modules/item/types'
import { buyThirdPartyItemSlotSuccess } from 'modules/thirdParty/actions'
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

describe('when reducing the action that signals the success of the transaction that publishes third party items', () => {
  let collection: Collection
  let items: Item[]
  let thirdParty: ThirdParty
  let transaction: Transaction
  let initialState: ThirdPartyState

  beforeEach(() => {
    collection = { id: '1' } as Collection
    items = [{ id: 'itemid1' }, { id: 'itemid2' }] as Item[]
    thirdParty = {
      id: '1',
      name: 'a third party',
      description: 'some desc',
      managers: ['0x1', '0x2'],
      maxItems: '0',
      totalItems: '0'
    }

    const action = publishThirdPartyItemsSuccess('0xhash', ChainId.MATIC_MUMBAI, thirdParty, collection, items)
    transaction = {
      ...getTransactionFromAction(action),
      actionType: action.type
    } as Transaction
    initialState = { ...INITIAL_STATE, data: { [thirdParty.id]: thirdParty } }
  })

  it('should update the total amount of items that a third party has', () => {
    expect(thirdPartyReducer(initialState, fetchTransactionSuccess(transaction))).toStrictEqual({
      ...initialState,
      data: {
        ...initialState.data,
        '1': {
          ...initialState.data['1'],
          totalItems: items.length.toString()
        }
      }
    })
  })
})
