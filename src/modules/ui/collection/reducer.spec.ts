import { setCollectionPageView } from './actions'
import { collectionReducer, INITIAL_STATE } from './reducer'
import { CollectionPageView } from './types'

describe('when an action of type SET_COLLECTION_PAGE_VIEW is called', () => {
  it('should set the new supplied view on the state', () => {
    expect(
      collectionReducer({ ...INITIAL_STATE, view: CollectionPageView.GRID }, setCollectionPageView(CollectionPageView.LIST))
    ).toStrictEqual({
      ...INITIAL_STATE,
      view: CollectionPageView.LIST
    })
  })
})
