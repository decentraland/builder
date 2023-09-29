import { ReactNode } from 'react'
import { useLocation } from 'react-router'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'
import NameTabs, { TAB_QUERY_PARAM_KEY } from './NameTabs'
import { TabType } from './NameTabs.types'

jest.mock('react-router')
jest.mock('decentraland-ui/dist/components/Media/Media')

const mockUseLocation = useLocation as jest.Mock
const mockMobile = Mobile as jest.Mock
const mockNotMobile = NotMobile as jest.Mock

describe('when rendering the name tabs component', () => {
  let location: Location
  let onNavigate: jest.Mock

  beforeEach(() => {
    location = {
      pathname: '/pathname'
    } as Location

    mockUseLocation.mockReturnValueOnce(location)

    onNavigate = jest.fn()
  })

  describe('when the tab param is not found in the location.search property', () => {
    beforeEach(() => {
      location.search = '?foo=bar'
    })

    it('should call the on navigate prop with the current pathname + current query params + the tab query param with dcl as value', () => {
      render(<NameTabs onNavigate={onNavigate} />)
      expect(onNavigate).toHaveBeenCalledWith(`${location.pathname}${location.search}&${TAB_QUERY_PARAM_KEY}=${TabType.DCL}`)
    })
  })

  describe('when the tab param is found in the location.search property but is not ens or dcl', () => {
    beforeEach(() => {
      location.search = `?foo=bar&${TAB_QUERY_PARAM_KEY}=invalid-tab`
    })

    it('should call the on navigate prop with the current pathname + current query params + the tab query param with dcl as value instead of the invalid value', () => {
      render(<NameTabs onNavigate={onNavigate} />)
      expect(onNavigate).toHaveBeenCalledWith(`${location.pathname}?foo=bar&${TAB_QUERY_PARAM_KEY}=${TabType.DCL}`)
    })
  })

  describe('when the tab param is found in location.search and is ens or dcl', () => {
    let dclTabText: string
    let ensTabText: string

    beforeEach(() => {
      location.search = `?${TAB_QUERY_PARAM_KEY}=${TabType.ENS}`
      dclTabText = 'Decentraland names'
      ensTabText = 'ENS names'

      mockMobile.mockImplementation(({ children }) => children as ReactNode)
      mockNotMobile.mockImplementation(() => null)
    })

    it('should render both the ens and dcl tabs name tabs', () => {
      render(<NameTabs onNavigate={onNavigate} />)

      expect(screen.getByText(dclTabText)).toBeInTheDocument()
      expect(screen.getByText(ensTabText)).toBeInTheDocument()
    })

    describe('when the tab param is ens', () => {
      it('should add the active css class to the ens tab', () => {
        render(<NameTabs onNavigate={onNavigate} />)

        expect(screen.getByText(ensTabText)).toHaveClass('active')
        expect(screen.getByText(dclTabText)).not.toHaveClass('active')
      })
    })

    describe('when the tab param is dcl', () => {
      beforeEach(() => {
        location.search = `?${TAB_QUERY_PARAM_KEY}=${TabType.DCL}`
      })

      it('should add the active css class to the dcl tab', () => {
        render(<NameTabs onNavigate={onNavigate} />)

        expect(screen.getByText(ensTabText)).not.toHaveClass('active')
        expect(screen.getByText(dclTabText)).toHaveClass('active')
      })
    })

    describe('when the dcl tab is clicked', () => {
      it('should call the on navigate prop with the current pathname + the tab query param with dcl as value', () => {
        render(<NameTabs onNavigate={onNavigate} />)

        screen.getByText(dclTabText).click()

        expect(onNavigate).toHaveBeenCalledWith(`${location.pathname}?${TAB_QUERY_PARAM_KEY}=${TabType.DCL}`)
      })
    })

    describe('when the ens tab is clicked', () => {
      it('should call the on navigate prop with the current pathname + the tab query param with ens as value', () => {
        render(<NameTabs onNavigate={onNavigate} />)

        screen.getByText(ensTabText).click()

        expect(onNavigate).toHaveBeenCalledWith(`${location.pathname}?${TAB_QUERY_PARAM_KEY}=${TabType.ENS}`)
      })
    })
  })
})
