import { fetchItemCurationsFailure, fetchItemCurationsRequest, fetchItemCurationsSuccess } from './actions'
import { INITIAL_STATE, itemCurationReducer, ItemCurationState } from './reducer'
import { ItemCuration } from './types'
import { CurationStatus } from '../types'

const getMockItemCuration = (props: Partial<ItemCuration> = {}): ItemCuration => ({
  id: 'id',
  itemId: 'itemId',
  status: CurationStatus.PENDING,
  createdAt: 0,
  updatedAt: 0,
  ...props
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
