import { fetchItemCurationsFailure, fetchItemCurationsRequest, fetchItemCurationsSuccess } from './actions'
import { INITIAL_STATE, itemCurationReducer, ItemCurationState } from './reducer'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import {
  publishThirdPartyItemsFailure,
  publishThirdPartyItemsRequest,
  publishThirdPartyItemsSuccess,
  publishAndPushChangesThirdPartyItemsRequest,
  pushChangesThirdPartyItemsFailure,
  pushChangesThirdPartyItemsRequest,
  pushChangesThirdPartyItemsSuccess,
  publishAndPushChangesThirdPartyItemsFailure,
  publishAndPushChangesThirdPartyItemsSuccess
} from 'modules/thirdParty/actions'
import { CurationStatus } from '../types'
import { ItemCuration } from './types'
import { ThirdParty } from 'modules/thirdParty/types'
import { mockedItem } from 'specs/item'

const getMockItemCuration = (props: Partial<ItemCuration> = {}): ItemCuration => ({
  id: 'id',
  itemId: 'itemId',
  status: CurationStatus.PENDING,
  createdAt: 0,
  updatedAt: 0,
  contentHash: 'aHash',
  ...props
})

describe('when an action of type PUBLISH_THIRD_PARTY_ITEMS_REQUEST is called', () => {
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
  it('should add a publishThirdPartyItemsRequest to the loading array', () => {
    expect(itemCurationReducer(INITIAL_STATE, publishThirdPartyItemsRequest(thirdParty, []))).toStrictEqual({
      ...INITIAL_STATE,
      loading: [publishThirdPartyItemsRequest(thirdParty, [])]
    })
  })
})

describe('when an action of type PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST is called', () => {
  it('should add a pushChangesThirdPartyItemsRequest to the loading array', () => {
    expect(itemCurationReducer(INITIAL_STATE, pushChangesThirdPartyItemsRequest([]))).toStrictEqual({
      ...INITIAL_STATE,
      loading: [pushChangesThirdPartyItemsRequest([])]
    })
  })
})

describe('when an action of type PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST is called', () => {
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
  it('should add a publishAndPushChangesThirdPartyItemsRequest to the loading array', () => {
    expect(
      itemCurationReducer(INITIAL_STATE, publishAndPushChangesThirdPartyItemsRequest(thirdParty, [mockedItem], [mockedItem]))
    ).toStrictEqual({
      ...INITIAL_STATE,
      loading: [publishAndPushChangesThirdPartyItemsRequest(thirdParty, [mockedItem], [mockedItem])]
    })
  })
})

describe('when an action of type PUBLISH_THIRD_PARTY_ITEMS_SUCCESS is called', () => {
  let thirdParty: ThirdParty
  let collection: Collection
  let items: Item[]
  let itemCurations: ItemCuration[]
  beforeEach(() => {
    collection = { id: 'collectionId' } as Collection
    thirdParty = {
      id: '1',
      name: 'a third party',
      description: 'some desc',
      managers: ['0x1', '0x2'],
      maxItems: '0',
      totalItems: '0'
    }
    itemCurations = [getMockItemCuration()]
  })
  it('should merge the old item curations with the new ones', () => {
    const state = {
      ...INITIAL_STATE,
      data: {
        collectionId: [getMockItemCuration({ id: 'originalItemCuration' })]
      }
    }
    expect(itemCurationReducer(state, publishThirdPartyItemsSuccess(thirdParty.id, collection.id, items, itemCurations))).toStrictEqual({
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

describe('when an action of type PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS is called', () => {
  let collection: Collection
  let itemCurationsFromPush: ItemCuration[]
  let itemCurationsFromPublish: ItemCuration[]
  beforeEach(() => {
    collection = { id: 'collectionId' } as Collection
    itemCurationsFromPush = [getMockItemCuration({ createdAt: 2 })] // push returns a new curation for the mockItem
    itemCurationsFromPublish = [getMockItemCuration({ createdAt: 3, itemId: 'another itemId' })] // publish returns a new curation for a different item
  })
  it('should replace the old curation for the new ones returned by the publish & push', () => {
    const state = {
      ...INITIAL_STATE,
      data: {
        collectionId: [getMockItemCuration({ createdAt: 1 })]
      }
    }
    expect(
      itemCurationReducer(
        state,
        publishAndPushChangesThirdPartyItemsSuccess(collection.id, [], [...itemCurationsFromPublish, ...itemCurationsFromPush])
      )
    ).toStrictEqual({
      ...state,
      data: {
        collectionId: [getMockItemCuration({ createdAt: 3, itemId: 'another itemId' }), getMockItemCuration({ createdAt: 2 })]
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

describe('when an action of type PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_FAILURE is called', () => {
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
        { ...INITIAL_STATE, loading: [publishAndPushChangesThirdPartyItemsRequest(thirdParty, [], [])] },
        publishAndPushChangesThirdPartyItemsFailure('Some Error')
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
