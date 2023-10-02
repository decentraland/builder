import { useLocation } from 'react-router'
import { TAB_QUERY_PARAM_KEY, TabType, useCurrentlySelectedTab } from './hooks'

jest.mock('react-router')

const mockUseLocation = useLocation as jest.Mock

describe('when calling the use currently selected tab hook', () => {
  let location: Location

  beforeEach(() => {
    location = {
      pathname: '',
      search: ''
    } as Location

    mockUseLocation.mockReturnValue(location)
  })

  describe('when the tab query param is not set', () => {
    beforeEach(() => {
      location.search = ''
    })

    it('should return tab as undefined', () => {
      expect(useCurrentlySelectedTab().tab).toBeUndefined()
    })
  })

  describe('when the tab query param is an invalid value', () => {
    beforeEach(() => {
      location.search = `?${TAB_QUERY_PARAM_KEY}=invalid`
    })

    it('should return tab as undefined', () => {
      expect(useCurrentlySelectedTab().tab).toBeUndefined()
    })
  })

  describe('when the tab query param is dcl', () => {
    beforeEach(() => {
      location.search = `?${TAB_QUERY_PARAM_KEY}=dcl`
    })

    it('should return tab as DCL', () => {
      expect(useCurrentlySelectedTab().tab).toBe(TabType.DCL)
    })
  })

  describe('when the tab query param is ens', () => {
    beforeEach(() => {
      location.search = `?${TAB_QUERY_PARAM_KEY}=ens`
    })

    it('should return tab as ENS', () => {
      expect(useCurrentlySelectedTab().tab).toBe(TabType.ENS)
    })
  })
})
