import { RootState } from 'modules/common/types'
import { locations } from 'routing/locations'
import { getThirdPartyCollectionId } from './selectors'

describe('when getting the third party collection id from the current url', () => {
  it('should return the collection id section of the url', () => {
    const collectionId = 'some-collection-id'
    const mockState = {
      router: {
        action: 'POP',
        location: {
          pathname: locations.thirdPartyCollectionDetail(collectionId)
        }
      }
    } as unknown

    expect(getThirdPartyCollectionId(mockState as RootState)).toEqual(collectionId)
  })
})
