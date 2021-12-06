import { downloadItemFailure, downloadItemRequest, downloadItemSuccess } from './actions'
import { INITIAL_STATE, itemReducer } from './reducer'

describe('when an action of type DOWNLOAD_ITEM_REQUEST is called', () => {
  const itemId = 'anItem'
  it('should add a downloadItemRequest to the loading array', () => {
    expect(itemReducer(INITIAL_STATE, downloadItemRequest(itemId))).toStrictEqual({
      ...INITIAL_STATE,
      loading: [downloadItemRequest(itemId)]
    })
  })
})

describe('when an action of type DOWNLOAD_ITEM_SUCCESS is called', () => {
  const itemId = 'anItem'
  const error = 'something went wrong'
  it('should remove a downloadItemRequest from the loading array and null the error', () => {
    expect(
      itemReducer(
        {
          ...INITIAL_STATE,
          loading: [downloadItemRequest(itemId)],
          error
        },
        downloadItemSuccess(itemId)
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      loading: [],
      error: null
    })
  })
})

describe('when an action of type DOWNLOAD_ITEM_FAILURE is called', () => {
  const itemId = 'anItem'
  const error = 'something went wrong'
  it('should remove a downloadItemRequest from the loading array and set the error', () => {
    expect(
      itemReducer(
        {
          ...INITIAL_STATE,
          loading: [downloadItemRequest(itemId)]
        },
        downloadItemFailure(itemId, error)
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      loading: [],
      error
    })
  })
})
