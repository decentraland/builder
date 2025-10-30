import { renderHook } from '@testing-library/react-hooks'
import { useSelector } from 'react-redux'
import { getCollection } from 'modules/collection/selectors'
import { useGetSelectedCollectionIdFromCurrentUrl } from 'modules/location/hooks'
import { RootState } from 'modules/common/types'
import { Collection } from './types'
import { useGetSelectedCollection } from './hooks'

// Mock the dependencies
jest.mock('react-redux', () => {
  const actual = jest.requireActual<typeof import('react-redux')>('react-redux')
  return {
    ...actual,
    useSelector: jest.fn(),
    connect:
      () =>
      <T>(component: T): T =>
        component
  }
})
jest.mock('modules/collection/selectors')
jest.mock('modules/location/hooks')

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>
const mockGetCollection = getCollection as jest.MockedFunction<typeof getCollection>
const mockUseGetSelectedCollectionIdFromCurrentUrl = useGetSelectedCollectionIdFromCurrentUrl as jest.MockedFunction<
  typeof useGetSelectedCollectionIdFromCurrentUrl
>

describe('when using the hook to get the selected collection', () => {
  const mockCollection: Collection = {
    id: 'collection-1',
    name: 'Test Collection',
    owner: '0x123',
    urn: 'urn:decentraland:mumbai:collections-v2:0x123:collection-1',
    isPublished: true,
    isApproved: false,
    minters: [],
    managers: ['0x123'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSelector.mockImplementation(selector => {
      return selector({} as RootState)
    })
  })

  describe('when a collection ID is present in the URL', () => {
    beforeEach(() => {
      mockUseGetSelectedCollectionIdFromCurrentUrl.mockReturnValueOnce('collection-1')
    })

    describe('and the collection exists in the store', () => {
      beforeEach(() => {
        mockGetCollection.mockReturnValueOnce(mockCollection)
      })

      it('should return the collection', () => {
        const { result } = renderHook(() => useGetSelectedCollection())

        expect(result.current).toEqual(mockCollection)
        expect(mockUseGetSelectedCollectionIdFromCurrentUrl).toHaveBeenCalledTimes(1)
        expect(mockUseSelector).toHaveBeenCalledTimes(1)
        expect(mockGetCollection).toHaveBeenCalledWith({}, 'collection-1')
      })
    })

    describe('and the collection does not exist in the store', () => {
      beforeEach(() => {
        mockGetCollection.mockReturnValueOnce(null)
      })

      it('should return null', () => {
        const { result } = renderHook(() => useGetSelectedCollection())

        expect(result.current).toBeNull()
        expect(mockUseGetSelectedCollectionIdFromCurrentUrl).toHaveBeenCalledTimes(1)
        expect(mockUseSelector).toHaveBeenCalledTimes(1)
        expect(mockGetCollection).toHaveBeenCalledWith({}, 'collection-1')
      })
    })
  })

  describe('when no collection ID is present in the URL', () => {
    beforeEach(() => {
      mockUseGetSelectedCollectionIdFromCurrentUrl.mockReturnValueOnce(null)
    })

    it('should return null without calling the selector', () => {
      const { result } = renderHook(() => useGetSelectedCollection())

      expect(result.current).toBeNull()
      expect(mockUseGetSelectedCollectionIdFromCurrentUrl).toHaveBeenCalledTimes(1)
      expect(mockUseSelector).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the collection ID changes', () => {
    let secondCollection: Collection

    beforeEach(() => {
      secondCollection = {
        ...mockCollection,
        id: 'collection-2',
        name: 'Second Collection'
      }
      mockUseGetSelectedCollectionIdFromCurrentUrl.mockReturnValueOnce('collection-1').mockReturnValueOnce('collection-2')
      mockGetCollection.mockReturnValueOnce(mockCollection).mockReturnValueOnce(secondCollection)
    })

    it('should return the new collection', () => {
      const { result, rerender } = renderHook(() => useGetSelectedCollection())

      // First render with collection-1
      expect(result.current).toEqual(mockCollection)

      rerender()

      // Update mocks for collection-2
      expect(result.current).toEqual(secondCollection)
      expect(mockGetCollection).toHaveBeenLastCalledWith({}, 'collection-2')
    })
  })
})
