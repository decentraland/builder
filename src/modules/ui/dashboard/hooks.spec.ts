import { renderHook } from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getPageFromSearchParams } from 'modules/location/url-parsers'
import { getProjects } from './selectors'
import { useGetProjects, useGetProjectCurrentPage } from './hooks'
import { Project } from 'modules/project/types'
import { RootState } from 'modules/common/types'

// Mock the dependencies
jest.mock('react-redux')
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn()
}))
jest.mock('modules/location/url-parsers')
jest.mock('./selectors')

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>
const mockGetPageFromSearchParams = getPageFromSearchParams as jest.MockedFunction<typeof getPageFromSearchParams>
const mockGetProjects = getProjects as jest.MockedFunction<typeof getProjects>

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

describe('useGetProjects', () => {
  let mockProjects: Project[]

  beforeEach(() => {
    mockProjects = [
      {
        id: '1',
        title: 'Project 1',
        description: 'Test project 1',
        thumbnail: 'thumbnail1.jpg',
        isPublic: true,
        sceneId: 'scene1',
        ethAddress: '0x123',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
        layout: { rows: 1, cols: 1 },
        isTemplate: false,
        video: null,
        templateStatus: null
      },
      {
        id: '2',
        title: 'Project 2',
        description: 'Test project 2',
        thumbnail: 'thumbnail2.jpg',
        isPublic: false,
        sceneId: 'scene2',
        ethAddress: '0x456',
        createdAt: '2023-01-03T00:00:00Z',
        updatedAt: '2023-01-04T00:00:00Z',
        layout: { rows: 2, cols: 2 },
        isTemplate: false,
        video: null,
        templateStatus: null
      }
    ]
  })

  describe('when getting projects with search parameters', () => {
    beforeEach(() => {
      mockLocationData.search = '?page=2&sort_by=newest'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetProjects.mockReturnValueOnce(mockProjects)
    })

    it('should return projects from selector with search params', () => {
      const { result } = renderHook(() => useGetProjects())

      expect(result.current).toEqual(mockProjects)
      expect(mockUseLocation).toHaveBeenCalledTimes(1)
      expect(mockUseSelector).toHaveBeenCalledTimes(1)
      expect(mockGetProjects).toHaveBeenCalledWith({}, mockLocationData.search)
    })
  })

  describe('when getting projects without search parameters', () => {
    beforeEach(() => {
      mockLocationData.search = ''
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetProjects.mockReturnValueOnce(mockProjects)
    })

    it('should return projects from selector with empty search params', () => {
      const { result } = renderHook(() => useGetProjects())

      expect(result.current).toEqual(mockProjects)
      expect(mockUseLocation).toHaveBeenCalledTimes(1)
      expect(mockUseSelector).toHaveBeenCalledTimes(1)
      expect(mockGetProjects).toHaveBeenCalledWith({}, '')
    })
  })

  describe('when no projects are found', () => {
    beforeEach(() => {
      mockLocationData.search = '?page=999'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockGetProjects.mockReturnValueOnce([])
    })

    it('should return empty array', () => {
      const { result } = renderHook(() => useGetProjects())

      expect(result.current).toEqual([])
      expect(mockUseLocation).toHaveBeenCalledTimes(1)
      expect(mockUseSelector).toHaveBeenCalledTimes(1)
      expect(mockGetProjects).toHaveBeenCalledWith({}, mockLocationData.search)
    })
  })
})

describe('useGetProjectCurrentPage', () => {
  describe('when page parameter is present in search params', () => {
    beforeEach(() => {
      mockLocationData.search = '?page=3'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockUseSelector.mockReturnValueOnce(5) // totalPages
      mockGetPageFromSearchParams.mockReturnValueOnce(3)
    })

    it('should return current page from search params', () => {
      const { result } = renderHook(() => useGetProjectCurrentPage())

      expect(result.current).toBe(3)
      expect(mockUseLocation).toHaveBeenCalledTimes(1)
      expect(mockUseSelector).toHaveBeenCalledTimes(1)
      expect(mockGetPageFromSearchParams).toHaveBeenCalledWith(mockLocationData.search, 5)
    })
  })

  describe('when page parameter exceeds total pages', () => {
    beforeEach(() => {
      mockLocationData.search = '?page=10'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockUseSelector.mockReturnValueOnce(3) // totalPages
      mockGetPageFromSearchParams.mockReturnValueOnce(3) // clamped to totalPages
    })

    it('should return page clamped to total pages', () => {
      const { result } = renderHook(() => useGetProjectCurrentPage())

      expect(result.current).toBe(3)
      expect(mockUseLocation).toHaveBeenCalledTimes(1)
      expect(mockUseSelector).toHaveBeenCalledTimes(1)
      expect(mockGetPageFromSearchParams).toHaveBeenCalledWith(mockLocationData.search, 3)
    })
  })

  describe('when no page parameter is present in search params', () => {
    beforeEach(() => {
      mockLocationData.search = ''
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockUseSelector.mockReturnValueOnce(5) // totalPages
      mockGetPageFromSearchParams.mockReturnValueOnce(1) // default page
    })

    it('should return default page 1', () => {
      const { result } = renderHook(() => useGetProjectCurrentPage())

      expect(result.current).toBe(1)
      expect(mockUseLocation).toHaveBeenCalledTimes(1)
      expect(mockUseSelector).toHaveBeenCalledTimes(1)
      expect(mockGetPageFromSearchParams).toHaveBeenCalledWith('', 5)
    })
  })

  describe('when invalid page parameter is present in search params', () => {
    beforeEach(() => {
      mockLocationData.search = '?page=invalid'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockUseSelector.mockReturnValueOnce(2) // totalPages
      mockGetPageFromSearchParams.mockReturnValueOnce(1) // default page for invalid input
    })

    it('should return default page 1', () => {
      const { result } = renderHook(() => useGetProjectCurrentPage())

      expect(result.current).toBe(1)
      expect(mockUseLocation).toHaveBeenCalledTimes(1)
      expect(mockUseSelector).toHaveBeenCalledTimes(1)
      expect(mockGetPageFromSearchParams).toHaveBeenCalledWith(mockLocationData.search, 2)
    })
  })

  describe('when total pages is 0', () => {
    beforeEach(() => {
      mockLocationData.search = '?page=1'
      mockUseLocation.mockReturnValueOnce(mockLocationData)
      mockUseSelector.mockReturnValueOnce(0) // totalPages
      mockGetPageFromSearchParams.mockReturnValueOnce(1)
    })

    it('should return page 1 even with 0 total pages', () => {
      const { result } = renderHook(() => useGetProjectCurrentPage())

      expect(result.current).toBe(1)
      expect(mockUseLocation).toHaveBeenCalledTimes(1)
      expect(mockUseSelector).toHaveBeenCalledTimes(1)
      expect(mockGetPageFromSearchParams).toHaveBeenCalledWith(mockLocationData.search, 0)
    })
  })
})
