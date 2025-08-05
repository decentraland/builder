import { renderHook } from '@testing-library/react-hooks'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { RootState } from 'modules/common/types'
import {
  useGetIsReviewingFromCurrentUrl,
  useGetSelectedCollectionIdFromCurrentUrl,
  useGetSelectedItemIdFromCurrentUrl
} from 'modules/location/hooks'
import { getCollection } from 'modules/collection/selectors'
import { isThirdPartyCollection } from 'modules/collection/utils'
import { getPaginatedCollectionItems } from 'modules/item/selectors'
import { getFirstWearableOrItem } from 'modules/item/utils'
import { getVisibleItemsFromUrl } from './selectors'
import { useGetVisibleItems, useGetSelectedItemId } from './hook'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'

// Mock the dependencies
jest.mock('react-redux')
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn()
}))
jest.mock('modules/location/hooks')
jest.mock('modules/collection/selectors')
jest.mock('modules/collection/utils')
jest.mock('modules/item/selectors')
jest.mock('modules/item/utils')
jest.mock('./selectors')

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>
const mockUseGetSelectedItemIdFromCurrentUrl = useGetSelectedItemIdFromCurrentUrl as jest.MockedFunction<
  typeof useGetSelectedItemIdFromCurrentUrl
>
const mockUseGetSelectedCollectionIdFromCurrentUrl = useGetSelectedCollectionIdFromCurrentUrl as jest.MockedFunction<
  typeof useGetSelectedCollectionIdFromCurrentUrl
>
const mockUseGetIsReviewingFromCurrentUrl = useGetIsReviewingFromCurrentUrl as jest.MockedFunction<typeof useGetIsReviewingFromCurrentUrl>
const mockGetCollection = getCollection as jest.MockedFunction<typeof getCollection>
const mockIsThirdPartyCollection = isThirdPartyCollection as jest.MockedFunction<typeof isThirdPartyCollection>
const mockGetPaginatedCollectionItems = getPaginatedCollectionItems as jest.MockedFunction<typeof getPaginatedCollectionItems>
const mockGetFirstWearableOrItem = getFirstWearableOrItem as jest.MockedFunction<typeof getFirstWearableOrItem>
const mockGetVisibleItemsFromUrl = getVisibleItemsFromUrl as jest.MockedFunction<typeof getVisibleItemsFromUrl>

let mockLocationData: {
  search: string
  pathname: string
  hash: string
  state: null
  key: string
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
  mockUseSelector.mockImplementation(selector => {
    return selector({} as RootState)
  })
  mockLocationData = {
    search: '',
    pathname: '',
    hash: '',
    state: null,
    key: ''
  }
})

describe('when getting visible items from url', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValueOnce(mockLocationData)
  })

  describe('when there are visible items in URL', () => {
    let mockVisibleItems: any[]

    beforeEach(() => {
      mockVisibleItems = [
        { id: 'item-123', name: 'Item 123', isPublished: true },
        { id: 'item-456', name: 'Item 456', isPublished: true }
      ] as any[]
      mockLocationData.search = '?item=item-123'
      mockGetVisibleItemsFromUrl.mockReturnValueOnce(mockVisibleItems)
    })

    it('should return visible items from URL using selector', () => {
      const { result } = renderHook(() => useGetVisibleItems())

      expect(result.current).toEqual(mockVisibleItems)
    })
  })

  describe('when there are no visible items found', () => {
    let mockVisibleItems: any[]

    beforeEach(() => {
      mockVisibleItems = []
      mockLocationData.search = ''
      mockGetVisibleItemsFromUrl.mockReturnValueOnce(mockVisibleItems)
    })

    it('should return empty array', () => {
      const { result } = renderHook(() => useGetVisibleItems())

      expect(result.current).toEqual([])
    })
  })
})

describe('when getting selected item id', () => {
  let mockCollection: Collection
  let mockItems: Item[]

  beforeEach(() => {
    mockCollection = {
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
    } as Collection
    mockItems = [
      { id: 'item-1', name: 'Item 1', isPublished: true },
      { id: 'item-2', name: 'Item 2', isPublished: false },
      { id: 'item-3', name: 'Item 3', isPublished: true }
    ] as Item[]
  })

  describe('when selectedItemId is available from URL', () => {
    beforeEach(() => {
      mockUseGetSelectedItemIdFromCurrentUrl.mockReturnValueOnce('selected-item-123')
      mockUseGetSelectedCollectionIdFromCurrentUrl.mockReturnValueOnce('collection-1')
      mockUseGetIsReviewingFromCurrentUrl.mockReturnValueOnce(false)
    })

    it('should return the selected item ID from URL', () => {
      const { result } = renderHook(() => useGetSelectedItemId())

      expect(result.current).toBe('selected-item-123')
    })
  })

  describe('when selectedItemId is not available from URL', () => {
    describe('and there is a collection ID', () => {
      describe('for a regular collection', () => {
        beforeEach(() => {
          mockUseGetSelectedItemIdFromCurrentUrl.mockReturnValueOnce(null)
          mockUseGetSelectedCollectionIdFromCurrentUrl.mockReturnValueOnce('collection-1')
          mockUseGetIsReviewingFromCurrentUrl.mockReturnValueOnce(false)
          mockGetCollection.mockReturnValueOnce(mockCollection)
          mockIsThirdPartyCollection.mockReturnValueOnce(false)
          mockGetPaginatedCollectionItems.mockReturnValueOnce(mockItems)
          mockGetFirstWearableOrItem.mockReturnValueOnce({ id: 'item-1' } as Item)
        })

        it('should return the first item from all items', () => {
          const { result } = renderHook(() => useGetSelectedItemId())

          expect(result.current).toBe('item-1')
          expect(mockGetCollection).toHaveBeenCalledWith({}, 'collection-1')
          expect(mockGetPaginatedCollectionItems).toHaveBeenCalledWith({}, 'collection-1')
          expect(mockGetFirstWearableOrItem).toHaveBeenCalledWith(mockItems)
        })
      })

      describe('for a third party collection while reviewing', () => {
        beforeEach(() => {
          mockUseGetSelectedItemIdFromCurrentUrl.mockReturnValueOnce(null)
          mockUseGetSelectedCollectionIdFromCurrentUrl.mockReturnValueOnce('collection-1')
          mockUseGetIsReviewingFromCurrentUrl.mockReturnValueOnce(true)
          mockGetCollection.mockReturnValueOnce(mockCollection)
          mockIsThirdPartyCollection.mockReturnValueOnce(true)
          mockGetPaginatedCollectionItems.mockReturnValueOnce(mockItems)
          mockGetFirstWearableOrItem.mockReturnValueOnce({ id: 'item-1' } as Item)
        })

        it('should return the first item from published items only', () => {
          const { result } = renderHook(() => useGetSelectedItemId())

          const publishedItems = mockItems.filter(item => item.isPublished)
          expect(result.current).toBe('item-1')
          expect(mockIsThirdPartyCollection).toHaveBeenCalledWith(mockCollection)
          expect(mockGetFirstWearableOrItem).toHaveBeenCalledWith(publishedItems)
        })
      })

      describe('for a third party collection not reviewing', () => {
        beforeEach(() => {
          mockUseGetSelectedItemIdFromCurrentUrl.mockReturnValueOnce(null)
          mockUseGetSelectedCollectionIdFromCurrentUrl.mockReturnValueOnce('collection-1')
          mockUseGetIsReviewingFromCurrentUrl.mockReturnValueOnce(false)
          mockGetCollection.mockReturnValueOnce(mockCollection)
          mockIsThirdPartyCollection.mockReturnValueOnce(true)
          mockGetPaginatedCollectionItems.mockReturnValueOnce(mockItems)
          mockGetFirstWearableOrItem.mockReturnValueOnce({ id: 'item-1' } as Item)
        })

        it('should return the first item from all items', () => {
          const { result } = renderHook(() => useGetSelectedItemId())

          expect(result.current).toBe('item-1')
          expect(mockGetFirstWearableOrItem).toHaveBeenCalledWith(mockItems)
        })
      })

      describe('when there are no items in the collection', () => {
        beforeEach(() => {
          mockUseGetSelectedItemIdFromCurrentUrl.mockReturnValueOnce(null)
          mockUseGetSelectedCollectionIdFromCurrentUrl.mockReturnValueOnce('collection-1')
          mockUseGetIsReviewingFromCurrentUrl.mockReturnValueOnce(false)
          mockGetCollection.mockReturnValueOnce(mockCollection)
          mockIsThirdPartyCollection.mockReturnValueOnce(false)
          mockGetPaginatedCollectionItems.mockReturnValueOnce([])
          mockGetFirstWearableOrItem.mockReturnValueOnce(undefined)
        })

        it('should return null', () => {
          const { result } = renderHook(() => useGetSelectedItemId())

          expect(result.current).toBeNull()
          expect(mockGetFirstWearableOrItem).toHaveBeenCalledWith([])
        })
      })

      describe('when collection does not exist', () => {
        beforeEach(() => {
          mockUseGetSelectedItemIdFromCurrentUrl.mockReturnValueOnce(null)
          mockUseGetSelectedCollectionIdFromCurrentUrl.mockReturnValueOnce('collection-1')
          mockUseGetIsReviewingFromCurrentUrl.mockReturnValueOnce(false)
          mockGetCollection.mockReturnValueOnce(null)
          mockIsThirdPartyCollection.mockReturnValueOnce(false)
          mockGetPaginatedCollectionItems.mockReturnValueOnce([])
          mockGetFirstWearableOrItem.mockReturnValueOnce(undefined)
        })

        it('should return null', () => {
          const { result } = renderHook(() => useGetSelectedItemId())

          expect(result.current).toBeNull()
          expect(mockGetCollection).toHaveBeenCalledWith({}, 'collection-1')
        })
      })
    })

    describe('when there is no collection ID', () => {
      beforeEach(() => {
        mockUseGetSelectedItemIdFromCurrentUrl.mockReturnValueOnce(null)
        mockUseGetSelectedCollectionIdFromCurrentUrl.mockReturnValueOnce(null)
        mockUseGetIsReviewingFromCurrentUrl.mockReturnValueOnce(false)
        mockGetCollection.mockReturnValueOnce(null)
        mockIsThirdPartyCollection.mockReturnValueOnce(false)
        mockGetPaginatedCollectionItems.mockReturnValueOnce([])
        mockGetFirstWearableOrItem.mockReturnValueOnce(undefined)
      })

      it('should return null', () => {
        const { result } = renderHook(() => useGetSelectedItemId())

        expect(result.current).toBeNull()
        expect(mockGetCollection).not.toHaveBeenCalled()
      })
    })
  })

  describe('when values change', () => {
    describe('when collection changes', () => {
      let collection2: Collection
      let items2: Item[]

      beforeEach(() => {
        collection2 = { ...mockCollection, id: 'collection-2' }
        items2 = [{ id: 'item-4', name: 'Item 4', isPublished: true }] as any[]

        mockUseGetSelectedItemIdFromCurrentUrl.mockReturnValueOnce(null).mockReturnValueOnce(null)
        mockUseGetSelectedCollectionIdFromCurrentUrl.mockReturnValueOnce('collection-1').mockReturnValueOnce('collection-2')
        mockUseGetIsReviewingFromCurrentUrl.mockReturnValueOnce(false).mockReturnValueOnce(false)
        mockGetCollection.mockReturnValueOnce(mockCollection).mockReturnValueOnce(collection2)
        mockIsThirdPartyCollection.mockReturnValueOnce(false).mockReturnValueOnce(false)
        mockGetPaginatedCollectionItems.mockReturnValueOnce(mockItems).mockReturnValueOnce(items2)
        mockGetFirstWearableOrItem.mockReturnValueOnce({ id: 'item-1' } as any).mockReturnValueOnce({ id: 'item-4' } as any)
      })

      it('should update when collection changes', () => {
        const { result, rerender } = renderHook(() => useGetSelectedItemId())

        expect(result.current).toBe('item-1')

        rerender()

        expect(result.current).toBe('item-4')
        expect(mockGetCollection).toHaveBeenCalledTimes(2)
        expect(mockGetPaginatedCollectionItems).toHaveBeenCalledTimes(2)
      })
    })

    describe('when reviewing status changes for third party collection', () => {
      let reviewingTestItems: Item[]
      let publishedItems: Item[]

      beforeEach(() => {
        reviewingTestItems = [
          { id: 'review-item-1', name: 'Review Item 1', isPublished: true },
          { id: 'review-item-2', name: 'Review Item 2', isPublished: false },
          { id: 'review-item-3', name: 'Review Item 3', isPublished: true }
        ] as any[]
        publishedItems = reviewingTestItems.filter(item => item.isPublished)

        mockUseGetSelectedItemIdFromCurrentUrl.mockReturnValueOnce(null).mockReturnValueOnce(null)
        mockUseGetSelectedCollectionIdFromCurrentUrl.mockReturnValueOnce('collection-1').mockReturnValueOnce('collection-1')
        mockUseGetIsReviewingFromCurrentUrl.mockReturnValueOnce(false).mockReturnValueOnce(true)
        mockGetCollection.mockReturnValueOnce(mockCollection).mockReturnValueOnce(mockCollection)
        mockIsThirdPartyCollection.mockReturnValueOnce(true).mockReturnValueOnce(true)
        mockGetPaginatedCollectionItems.mockReturnValueOnce(reviewingTestItems).mockReturnValueOnce(reviewingTestItems)
        mockGetFirstWearableOrItem.mockReturnValueOnce({ id: 'review-item-1' } as any).mockReturnValueOnce({ id: 'review-item-1' } as any)
      })

      it('should update when reviewing status changes for third party collection', () => {
        const { result, rerender } = renderHook(() => useGetSelectedItemId())

        // First render - not reviewing, uses all items
        expect(result.current).toBe('review-item-1')
        expect(mockGetFirstWearableOrItem).toHaveBeenCalledWith(reviewingTestItems)

        rerender()

        // Second render - reviewing, uses only published items
        expect(result.current).toBe('review-item-1')
        expect(mockGetFirstWearableOrItem).toHaveBeenLastCalledWith(publishedItems)
      })
    })
  })
})
