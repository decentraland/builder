import { MerkleDistributorInfo } from '@dcl/content-hash-tree/dist/types'
import { Collection } from 'modules/collection/types'
import { ThirdPartyBuildEntityError, ThirdPartyDeploymentError, ThirdPartyError } from 'modules/collection/utils'
import { mockedItem } from 'specs/item'
import {
  fetchThirdPartiesRequest,
  fetchThirdPartiesSuccess,
  fetchThirdPartiesFailure,
  deployBatchedThirdPartyItemsRequest,
  DEPLOY_BATCHED_THIRD_PARTY_ITEMS_SUCCESS,
  deployBatchedThirdPartyItemsSuccess,
  deployBatchedThirdPartyItemsFailure,
  DEPLOY_BATCHED_THIRD_PARTY_ITEMS_FAILURE
} from './actions'
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
      itemSlotPrice: 1,
      errors: []
    }

    expect(thirdPartyReducer(state, fetchThirdPartiesSuccess([thirdParty]))).toStrictEqual({
      data: {
        [thirdParty.id]: thirdParty
      },
      loading: [],
      error: null,
      errors: [],
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

describe('when reducing an DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST action', () => {
  it('should add the action to the loading array', () => {
    expect(
      thirdPartyReducer(INITIAL_STATE, deployBatchedThirdPartyItemsRequest([], {} as Collection, {} as MerkleDistributorInfo, {}))
    ).toStrictEqual({
      ...INITIAL_STATE,
      loading: [deployBatchedThirdPartyItemsRequest([], {} as Collection, {} as MerkleDistributorInfo, {})]
    })
  })
})

describe('when reducing an DEPLOY_BATCHED_THIRD_PARTY_ITEMS_SUCCESS action', () => {
  it('should remove the corresponding request action from the loading state and set the error to null', () => {
    expect(
      thirdPartyReducer(
        { ...INITIAL_STATE, error: 'someError', loading: [{ type: DEPLOY_BATCHED_THIRD_PARTY_ITEMS_SUCCESS }] },
        deployBatchedThirdPartyItemsSuccess({} as Collection, [])
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      loading: [],
      error: null
    })
  })
})

describe('when reducing an DEPLOY_BATCHED_THIRD_PARTY_ITEMS_FAILURE action', () => {
  let errors: ThirdPartyError[]
  beforeEach(() => {
    errors = [new ThirdPartyDeploymentError(mockedItem), new ThirdPartyBuildEntityError(mockedItem)]
  })
  it('should remove the corresponding request action from the loading state and set the error', () => {
    expect(
      thirdPartyReducer(
        { ...INITIAL_STATE, loading: [{ type: DEPLOY_BATCHED_THIRD_PARTY_ITEMS_FAILURE }] },
        deployBatchedThirdPartyItemsFailure(errors, 'error')
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      loading: [],
      error: 'error',
      errors
    })
  })
})
