import { RootState } from 'modules/common/types'
import { locations } from 'routing/locations'
import { getCollectionId, getFromParam } from './selectors'

describe('when getting the collection id from the current url', () => {
  describe('when the collection is standard', () => {
    it('should return the collection id section of the url', () => {
      const collectionId = 'some-standard-collection-id'
      const mockState = {
        router: {
          action: 'POP',
          location: {
            pathname: locations.collectionDetail(collectionId)
          }
        }
      } as unknown

      expect(getCollectionId(mockState as RootState)).toEqual(collectionId)
    })
  })

  describe('when the collection is third party', () => {
    it('should return the collection id section of the url', () => {
      const collectionId = 'some-thirdparty-collection-id'
      const mockState = {
        router: {
          action: 'POP',
          location: {
            pathname: locations.thirdPartyCollectionDetail(collectionId)
          }
        }
      } as unknown

      expect(getCollectionId(mockState as RootState)).toEqual(collectionId)
    })
  })
})

describe('when getting the query param from', () => {
  describe('when the query param from is "collections"', () => {
    it('should return "collections"', () => {
      const collectionId = 'collection-id'
      const fromParam = 'collections'
      const mockState = {
        router: {
          action: 'PUSH',
          location: {
            pathname: locations.itemEditor({ collectionId, fromParam }),
            search: `?collection=${collectionId}&from=${fromParam}`
          }
        }
      } as unknown
      expect(getFromParam(mockState as RootState)).toEqual(fromParam)
    })
  })
})
