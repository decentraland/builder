import { renderHook } from '@testing-library/react'
import { useLocation } from 'react-router'
import {
  getCollectionIdFromUrl,
  getENSNameFromPath,
  getItemIdFromPath,
  getLandIdFromPath,
  getPageFromSearchParams,
  getProjectIdFromPath,
  getSelectedCollectionIdFromSearchParams,
  getSelectedItemIdFromSearchParams,
  getSortByFromSearchParams,
  getTemplateIdFromPath,
  isReviewingFromSearchParams
} from './url-parsers'
import {
  useGetSelectedItemIdFromCurrentUrl,
  useGetSelectedCollectionIdFromCurrentUrl,
  useGetIsReviewingFromCurrentUrl,
  useGetLandIdFromCurrentUrl,
  useGetProjectIdFromCurrentUrl,
  useGetTemplateIdFromCurrentUrl,
  useGetCollectionIdFromCurrentUrl,
  useGetENSNameFromCurrentUrl,
  useGetItemIdFromCurrentUrl,
  useGetCurrentPageFromCurrentUrl,
  useGetSortByFromCurrentUrl
} from './hooks'

// Mock the dependencies
jest.mock('react-router')
jest.mock('./url-parsers')

const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>
const mockGetSelectedItemIdFromSearchParams = getSelectedItemIdFromSearchParams as jest.MockedFunction<
  typeof getSelectedItemIdFromSearchParams
>
const mockGetSelectedCollectionIdFromSearchParams = getSelectedCollectionIdFromSearchParams as jest.MockedFunction<
  typeof getSelectedCollectionIdFromSearchParams
>
const mockIsReviewingFromSearchParams = isReviewingFromSearchParams as jest.MockedFunction<typeof isReviewingFromSearchParams>
const mockGetLandIdFromPath = getLandIdFromPath as jest.MockedFunction<typeof getLandIdFromPath>
const mockGetProjectIdFromPath = getProjectIdFromPath as jest.MockedFunction<typeof getProjectIdFromPath>
const mockGetTemplateIdFromPath = getTemplateIdFromPath as jest.MockedFunction<typeof getTemplateIdFromPath>
const mockGetCollectionIdFromUrl = getCollectionIdFromUrl as jest.MockedFunction<typeof getCollectionIdFromUrl>
const mockGetENSNameFromPath = getENSNameFromPath as jest.MockedFunction<typeof getENSNameFromPath>
const mockGetItemIdFromPath = getItemIdFromPath as jest.MockedFunction<typeof getItemIdFromPath>
const mockGetPageFromSearchParams = getPageFromSearchParams as jest.MockedFunction<typeof getPageFromSearchParams>
const mockGetSortByFromSearchParams = getSortByFromSearchParams as jest.MockedFunction<typeof getSortByFromSearchParams>

let mockLocationData: {
  search: string
  pathname: string
  hash: string
  state: null
  key: string
}

beforeEach(() => {
  jest.clearAllMocks()
  mockLocationData = {
    search: '',
    pathname: '',
    hash: '',
    state: null,
    key: ''
  }
})

describe('when getting the selected item id from current url', () => {
  describe('when item parameter is present in search params', () => {
    beforeEach(() => {
      mockLocationData.search = '?item=item-123'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetSelectedItemIdFromSearchParams.mockReturnValueOnce('item-123')
    })

    it('should return selected item ID from search params', () => {
      const { result } = renderHook(() => useGetSelectedItemIdFromCurrentUrl())

      expect(result.current).toBe('item-123')
      expect(mockGetSelectedItemIdFromSearchParams).toHaveBeenCalledWith(mockLocationData.search)
    })
  })

  describe('when no item parameter is present in search params', () => {
    beforeEach(() => {
      mockLocationData.search = ''
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetSelectedItemIdFromSearchParams.mockReturnValueOnce(null)
    })

    it('should return null', () => {
      const { result } = renderHook(() => useGetSelectedItemIdFromCurrentUrl())

      expect(result.current).toBeNull()
      expect(mockGetSelectedItemIdFromSearchParams).toHaveBeenCalledWith(mockLocationData.search)
    })
  })
})

describe('when getting the selected collection id from current url', () => {
  describe('when collection parameter is present in search params', () => {
    beforeEach(() => {
      mockLocationData.search = '?collection=collection-123'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetSelectedCollectionIdFromSearchParams.mockReturnValueOnce('collection-123')
    })

    it('should return selected collection ID from search params', () => {
      const { result } = renderHook(() => useGetSelectedCollectionIdFromCurrentUrl())

      expect(result.current).toBe('collection-123')
      expect(mockGetSelectedCollectionIdFromSearchParams).toHaveBeenCalledWith(mockLocationData.search)
    })
  })

  describe('when no collection parameter is present in search params', () => {
    beforeEach(() => {
      mockLocationData.search = ''
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetSelectedCollectionIdFromSearchParams.mockReturnValueOnce(null)
    })

    it('should return null', () => {
      const { result } = renderHook(() => useGetSelectedCollectionIdFromCurrentUrl())

      expect(result.current).toBeNull()
      expect(mockGetSelectedCollectionIdFromSearchParams).toHaveBeenCalledWith(mockLocationData.search)
    })
  })
})

describe('when getting the reviewing status from current url', () => {
  describe('when reviewing parameter is true', () => {
    beforeEach(() => {
      mockLocationData.search = '?reviewing=true'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockIsReviewingFromSearchParams.mockReturnValueOnce(true)
    })

    it('should return true', () => {
      const { result } = renderHook(() => useGetIsReviewingFromCurrentUrl())

      expect(result.current).toBe(true)
      expect(mockIsReviewingFromSearchParams).toHaveBeenCalledWith(mockLocationData.search)
    })
  })

  describe('when reviewing parameter is not true', () => {
    beforeEach(() => {
      mockLocationData.search = '?reviewing=false'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockIsReviewingFromSearchParams.mockReturnValueOnce(false)
    })

    it('should return false', () => {
      const { result } = renderHook(() => useGetIsReviewingFromCurrentUrl())

      expect(result.current).toBe(false)
      expect(mockIsReviewingFromSearchParams).toHaveBeenCalledWith(mockLocationData.search)
    })
  })
})

describe('when getting the land id from current url', () => {
  describe('when pathname contains a land ID', () => {
    beforeEach(() => {
      mockLocationData.pathname = '/land/123,456'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetLandIdFromPath.mockReturnValueOnce('123,456')
    })

    it('should return land ID from pathname', () => {
      const { result } = renderHook(() => useGetLandIdFromCurrentUrl())

      expect(result.current).toBe('123,456')
      expect(mockGetLandIdFromPath).toHaveBeenCalledWith(mockLocationData.pathname)
    })
  })

  describe('when pathname does not contain a land ID', () => {
    beforeEach(() => {
      mockLocationData.pathname = '/home'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetLandIdFromPath.mockReturnValueOnce(null)
    })

    it('should return null', () => {
      const { result } = renderHook(() => useGetLandIdFromCurrentUrl())

      expect(result.current).toBeNull()
      expect(mockGetLandIdFromPath).toHaveBeenCalledWith(mockLocationData.pathname)
    })
  })
})

describe('when getting the project id from current url', () => {
  describe('when pathname contains a project ID', () => {
    beforeEach(() => {
      mockLocationData.pathname = '/scenes/project-123'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetProjectIdFromPath.mockReturnValueOnce('project-123')
    })

    it('should return project ID from pathname', () => {
      const { result } = renderHook(() => useGetProjectIdFromCurrentUrl())

      expect(result.current).toBe('project-123')
      expect(mockGetProjectIdFromPath).toHaveBeenCalledWith(mockLocationData.pathname)
    })
  })

  describe('when pathname does not contain a project ID', () => {
    beforeEach(() => {
      mockLocationData.pathname = '/home'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetProjectIdFromPath.mockReturnValueOnce(null)
    })

    it('should return null', () => {
      const { result } = renderHook(() => useGetProjectIdFromCurrentUrl())

      expect(result.current).toBeNull()
      expect(mockGetProjectIdFromPath).toHaveBeenCalledWith(mockLocationData.pathname)
    })
  })
})

describe('when getting the template id from current url', () => {
  describe('when pathname contains a template ID', () => {
    beforeEach(() => {
      mockLocationData.pathname = '/templates/template-123'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetTemplateIdFromPath.mockReturnValueOnce('template-123')
    })

    it('should return template ID from pathname', () => {
      const { result } = renderHook(() => useGetTemplateIdFromCurrentUrl())

      expect(result.current).toBe('template-123')
      expect(mockGetTemplateIdFromPath).toHaveBeenCalledWith(mockLocationData.pathname)
    })
  })

  describe('when pathname does not contain a template ID', () => {
    beforeEach(() => {
      mockLocationData.pathname = '/home'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetTemplateIdFromPath.mockReturnValueOnce(null)
    })

    it('should return null', () => {
      const { result } = renderHook(() => useGetTemplateIdFromCurrentUrl())

      expect(result.current).toBeNull()
      expect(mockGetTemplateIdFromPath).toHaveBeenCalledWith(mockLocationData.pathname)
    })
  })
})

describe('when getting the collection id from current url', () => {
  describe('when pathname contains a collection ID', () => {
    beforeEach(() => {
      mockLocationData.pathname = '/collections/collection-123'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetCollectionIdFromUrl.mockReturnValueOnce('collection-123')
    })

    it('should return collection ID from pathname using combined parser', () => {
      const { result } = renderHook(() => useGetCollectionIdFromCurrentUrl())

      expect(result.current).toBe('collection-123')
      expect(mockGetCollectionIdFromUrl).toHaveBeenCalledWith(mockLocationData.pathname)
    })
  })

  describe('when pathname does not contain a collection ID', () => {
    beforeEach(() => {
      mockLocationData.pathname = '/home'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetCollectionIdFromUrl.mockReturnValueOnce(null)
    })

    it('should return null', () => {
      const { result } = renderHook(() => useGetCollectionIdFromCurrentUrl())

      expect(result.current).toBeNull()
      expect(mockGetCollectionIdFromUrl).toHaveBeenCalledWith(mockLocationData.pathname)
    })
  })
})

describe('when getting the ens name from current url', () => {
  describe('when pathname contains an ENS name', () => {
    beforeEach(() => {
      mockLocationData.pathname = '/names/example.dcl.eth'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetENSNameFromPath.mockReturnValueOnce('example.dcl.eth')
    })

    it('should return ENS name from pathname', () => {
      const { result } = renderHook(() => useGetENSNameFromCurrentUrl())

      expect(result.current).toBe('example.dcl.eth')
      expect(mockGetENSNameFromPath).toHaveBeenCalledWith(mockLocationData.pathname)
    })
  })

  describe('when pathname does not contain an ENS name', () => {
    beforeEach(() => {
      mockLocationData.pathname = '/home'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetENSNameFromPath.mockReturnValueOnce(null)
    })

    it('should return null', () => {
      const { result } = renderHook(() => useGetENSNameFromCurrentUrl())

      expect(result.current).toBeNull()
      expect(mockGetENSNameFromPath).toHaveBeenCalledWith(mockLocationData.pathname)
    })
  })
})

describe('when getting the item id from current url', () => {
  describe('when pathname contains an item ID', () => {
    beforeEach(() => {
      mockLocationData.pathname = '/items/item-123'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetItemIdFromPath.mockReturnValueOnce('item-123')
    })

    it('should return item ID from pathname', () => {
      const { result } = renderHook(() => useGetItemIdFromCurrentUrl())

      expect(result.current).toBe('item-123')
      expect(mockGetItemIdFromPath).toHaveBeenCalledWith(mockLocationData.pathname)
    })
  })

  describe('when pathname does not contain an item ID', () => {
    beforeEach(() => {
      mockLocationData.pathname = '/home'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetItemIdFromPath.mockReturnValueOnce(null)
    })

    it('should return null', () => {
      const { result } = renderHook(() => useGetItemIdFromCurrentUrl())

      expect(result.current).toBeNull()
      expect(mockGetItemIdFromPath).toHaveBeenCalledWith(mockLocationData.pathname)
    })
  })
})

describe('when getting the current page from current url', () => {
  describe('when page parameter is present in search params', () => {
    beforeEach(() => {
      mockLocationData.search = '?page=3'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetPageFromSearchParams.mockReturnValueOnce(3)
    })

    it('should return current page from search params', () => {
      const { result } = renderHook(() => useGetCurrentPageFromCurrentUrl())

      expect(result.current).toBe(3)
      expect(mockGetPageFromSearchParams).toHaveBeenCalledWith(mockLocationData.search, undefined)
    })
  })

  describe('when page parameter is present with totalPages limit', () => {
    beforeEach(() => {
      mockLocationData.search = '?page=5'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetPageFromSearchParams.mockReturnValueOnce(3)
    })

    it('should return current page limited by totalPages', () => {
      const { result } = renderHook(() => useGetCurrentPageFromCurrentUrl(3))

      expect(result.current).toBe(3)
      expect(mockGetPageFromSearchParams).toHaveBeenCalledWith(mockLocationData.search, 3)
    })
  })

  describe('when no page parameter is present in search params', () => {
    beforeEach(() => {
      mockLocationData.search = ''
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetPageFromSearchParams.mockReturnValueOnce(1)
    })

    it('should return default page 1', () => {
      const { result } = renderHook(() => useGetCurrentPageFromCurrentUrl())

      expect(result.current).toBe(1)
      expect(mockGetPageFromSearchParams).toHaveBeenCalledWith(mockLocationData.search, undefined)
    })
  })

  describe('when invalid page parameter is present in search params', () => {
    beforeEach(() => {
      mockLocationData.search = '?page=invalid'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetPageFromSearchParams.mockReturnValueOnce(1)
    })

    it('should return default page 1', () => {
      const { result } = renderHook(() => useGetCurrentPageFromCurrentUrl())

      expect(result.current).toBe(1)
      expect(mockGetPageFromSearchParams).toHaveBeenCalledWith(mockLocationData.search, undefined)
    })
  })
})

describe('when getting the sort by from current url', () => {
  describe('when sort_by parameter is present in search params', () => {
    beforeEach(() => {
      mockLocationData.search = '?sort_by=newest'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetSortByFromSearchParams.mockReturnValueOnce('NEWEST')
    })

    it('should return sort by value from search params', () => {
      const sortOptions = ['NEWEST', 'OLDEST', 'NAME']
      const { result } = renderHook(() => useGetSortByFromCurrentUrl(sortOptions, 'NEWEST'))

      expect(result.current).toBe('NEWEST')
      expect(mockGetSortByFromSearchParams).toHaveBeenCalledWith(mockLocationData.search, sortOptions, 'NEWEST')
    })
  })

  describe('when sort_by parameter matches valid option with different case', () => {
    beforeEach(() => {
      mockLocationData.search = '?sort_by=OLDEST'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetSortByFromSearchParams.mockReturnValueOnce('OLDEST')
    })

    it('should return matching sort by value', () => {
      const sortOptions = ['NEWEST', 'OLDEST', 'NAME']
      const { result } = renderHook(() => useGetSortByFromCurrentUrl(sortOptions, 'NEWEST'))

      expect(result.current).toBe('OLDEST')
      expect(mockGetSortByFromSearchParams).toHaveBeenCalledWith(mockLocationData.search, sortOptions, 'NEWEST')
    })
  })

  describe('when sort_by parameter is invalid', () => {
    beforeEach(() => {
      mockLocationData.search = '?sort_by=invalid'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetSortByFromSearchParams.mockReturnValueOnce('NEWEST')
    })

    it('should return default value', () => {
      const sortOptions = ['NEWEST', 'OLDEST', 'NAME']
      const { result } = renderHook(() => useGetSortByFromCurrentUrl(sortOptions, 'NEWEST'))

      expect(result.current).toBe('NEWEST')
      expect(mockGetSortByFromSearchParams).toHaveBeenCalledWith(mockLocationData.search, sortOptions, 'NEWEST')
    })
  })

  describe('when no sort_by parameter is present in search params', () => {
    beforeEach(() => {
      mockLocationData.search = ''
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetSortByFromSearchParams.mockReturnValueOnce('OLDEST')
    })

    it('should return default value', () => {
      const sortOptions = ['NEWEST', 'OLDEST', 'NAME']
      const { result } = renderHook(() => useGetSortByFromCurrentUrl(sortOptions, 'OLDEST'))

      expect(result.current).toBe('OLDEST')
      expect(mockGetSortByFromSearchParams).toHaveBeenCalledWith(mockLocationData.search, sortOptions, 'OLDEST')
    })
  })
})
