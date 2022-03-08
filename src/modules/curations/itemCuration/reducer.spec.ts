import { fetchItemCurationsFailure, fetchItemCurationsRequest, fetchItemCurationsSuccess } from './actions'
import { INITIAL_STATE, itemCurationReducer, ItemCurationState } from './reducer'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import {
  publishThirdPartyItemsFailure,
  publishThirdPartyItemsRequest,
  publishThirdPartyItemsSuccess,
  pushChangesThirdPartyItemsFailure,
  pushChangesThirdPartyItemsRequest,
  pushChangesThirdPartyItemsSuccess
} from 'modules/thirdParty/actions'
import { CurationStatus } from '../types'
import { ItemCuration } from './types'
import { ThirdParty } from 'modules/thirdParty/types'

const getMockItemCuration = (props: Partial<ItemCuration> = {}): ItemCuration => ({
  id: 'id',
  itemId: 'itemId',
  status: CurationStatus.PENDING,
  createdAt: 0,
  updatedAt: 0,
  ...props
})

describe('when an action of type PUBLISH_THIRD_PARTY_ITEMS_SUCCESS is called', () => {
  let collection: Collection
  let items: Item[]
  let itemCurations: ItemCuration[]
  beforeEach(() => {
    collection = { id: 'collectionId' } as Collection
    itemCurations = [getMockItemCuration()]
  })
  it('should merge the old item curations with the new ones', () => {
    const state = {
      ...INITIAL_STATE,
      data: {
        collectionId: [getMockItemCuration({ id: 'originalItemCuration' })]
      }
    }
    expect(itemCurationReducer(state, publishThirdPartyItemsSuccess(collection.id, items, itemCurations))).toStrictEqual({
      ...state,
      data: {
        collectionId: [getMockItemCuration({ id: 'originalItemCuration' }), getMockItemCuration()]
      }
    })
  })
})

describe('when an action of type PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS is called', () => {
  let collection: Collection
  let itemCurations: ItemCuration[]
  beforeEach(() => {
    collection = { id: 'collectionId' } as Collection
    itemCurations = [getMockItemCuration({ createdAt: 2 })]
  })
  it('should replace the old curation for the new one', () => {
    const state = {
      ...INITIAL_STATE,
      data: {
        collectionId: [getMockItemCuration({ createdAt: 1 })]
      }
    }
    expect(itemCurationReducer(state, pushChangesThirdPartyItemsSuccess(collection.id, itemCurations))).toStrictEqual({
      ...state,
      data: {
        collectionId: [getMockItemCuration({ createdAt: 2 })]
      }
    })
  })
})

describe('when an action of type PUBLISH_THIRD_PARTY_ITEMS_FAILURE is called', () => {
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
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      itemCurationReducer(
        { ...INITIAL_STATE, loading: [publishThirdPartyItemsRequest(thirdParty, [])] },
        publishThirdPartyItemsFailure('Some Error')
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})

describe('when an action of type PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      itemCurationReducer(
        { ...INITIAL_STATE, loading: [pushChangesThirdPartyItemsRequest([])] },
        pushChangesThirdPartyItemsFailure('Some Error')
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})

describe('when an action of type FETCH_ITEM_CURATIONS_REQUEST is called', () => {
  it('should add a fetchItemCurationsRequest to the loading array', () => {
    expect(itemCurationReducer(INITIAL_STATE, fetchItemCurationsRequest('collectionId'))).toStrictEqual({
      ...INITIAL_STATE,
      loading: [fetchItemCurationsRequest('collectionId')]
    })
  })
})

describe('when an action of type FETCH_ITEM_CURATIONS_SUCCESS is called', () => {
  it('should add the item curations to the data, remove the action from loading and set the error to null', () => {
    const state: ItemCurationState = {
      data: {},
      loading: [fetchItemCurationsRequest('collectionId')],
      error: 'Some Error'
    }

    expect(itemCurationReducer(state, fetchItemCurationsSuccess('collectionId', [getMockItemCuration()]))).toStrictEqual({
      data: {
        collectionId: [getMockItemCuration()]
      },
      loading: [],
      error: null
    })
  })
})

describe('when an action of type FETCH_ITEM_CURATIONS_FAILURE is called', () => {
  it('should remove the corresponding request action, and set the error', () => {
    expect(
      itemCurationReducer(
        { ...INITIAL_STATE, loading: [fetchItemCurationsRequest('collectionId')] },
        fetchItemCurationsFailure('Some Error')
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      error: 'Some Error'
    })
  })
})
