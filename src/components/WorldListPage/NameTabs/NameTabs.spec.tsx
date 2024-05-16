import { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'
import NameTabs from './NameTabs'
import { TAB_QUERY_PARAM_KEY, TabType, UseCurrentlySelectedTabResult, useCurrentlySelectedTab } from '../hooks'

jest.mock('decentraland-ui/dist/components/Media/Media')
jest.mock('../hooks')

const mockUseCurrentlySelectedTab = useCurrentlySelectedTab as jest.Mock
const mockMobile = Mobile as jest.Mock
const mockNotMobile = NotMobile as jest.Mock

const dclTabText = 'Decentraland NAMEs'
const ensTabText = 'ENS Domains'
const contributorTabText = 'Contributor'

describe('when rendering the name tabs component', () => {
  let useCurrentlySelectedTabResult: UseCurrentlySelectedTabResult
  let onNavigate: jest.Mock

  beforeEach(() => {
    useCurrentlySelectedTabResult = {
      tab: TabType.DCL,
      pathname: '/pathname',
      urlSearchParams: new URLSearchParams('?foo=bar')
    } as UseCurrentlySelectedTabResult

    mockUseCurrentlySelectedTab.mockReturnValueOnce(useCurrentlySelectedTabResult)

    onNavigate = jest.fn()
  })

  describe('when the tab param is returned as undefined by the currently selected tab hook', () => {
    beforeEach(() => {
      useCurrentlySelectedTabResult.tab = undefined
    })

    it('should call the on navigate prop with the pathname, url search params and an added tab query param with dcl as value', () => {
      render(<NameTabs onNavigate={onNavigate} isWorldContributorEnabled />)
      expect(onNavigate).toHaveBeenCalledWith(
        `${useCurrentlySelectedTabResult.pathname}?${useCurrentlySelectedTabResult.urlSearchParams.toString()}&${TAB_QUERY_PARAM_KEY}=${
          TabType.DCL
        }`
      )
    })
  })

  describe('when the tab param is returned as dcl, ens or contributor by the currently selected tab hook', () => {
    beforeEach(() => {
      useCurrentlySelectedTabResult.tab = TabType.DCL

      mockMobile.mockImplementation(({ children }) => children as ReactNode)
      mockNotMobile.mockImplementation(() => null)
    })

    it('should render both the ens, dcl and contributor tabs name tabs', () => {
      render(<NameTabs onNavigate={onNavigate} isWorldContributorEnabled />)

      expect(screen.getByText(dclTabText)).toBeInTheDocument()
      expect(screen.getByText(ensTabText)).toBeInTheDocument()
      expect(screen.getByText(contributorTabText)).toBeInTheDocument()
    })

    describe('when the tab param is ens', () => {
      beforeEach(() => {
        useCurrentlySelectedTabResult.tab = TabType.ENS
      })

      it('should add the active css class to the ens tab', () => {
        render(<NameTabs onNavigate={onNavigate} isWorldContributorEnabled />)

        expect(screen.getByText(ensTabText)).toHaveClass('active')
        expect(screen.getByText(contributorTabText)).not.toHaveClass('active')
        expect(screen.getByText(dclTabText)).not.toHaveClass('active')
      })
    })

    describe('when the tab param is dcl', () => {
      beforeEach(() => {
        useCurrentlySelectedTabResult.tab = TabType.DCL
      })

      it('should add the active css class to the dcl tab', () => {
        render(<NameTabs onNavigate={onNavigate} isWorldContributorEnabled />)

        expect(screen.getByText(ensTabText)).not.toHaveClass('active')
        expect(screen.getByText(contributorTabText)).not.toHaveClass('active')
        expect(screen.getByText(dclTabText)).toHaveClass('active')
      })
    })

    describe('when the tab param is contributor', () => {
      beforeEach(() => {
        useCurrentlySelectedTabResult.tab = TabType.CONTRIBUTOR
      })

      it('should add the active css class to the contributor tab', () => {
        render(<NameTabs onNavigate={onNavigate} isWorldContributorEnabled />)

        expect(screen.getByText(ensTabText)).not.toHaveClass('active')
        expect(screen.getByText(contributorTabText)).toHaveClass('active')
        expect(screen.getByText(dclTabText)).not.toHaveClass('active')
      })
    })

    describe('when the dcl tab is clicked', () => {
      it('should call the on navigate prop with the current pathname + the tab query param with dcl as value', () => {
        render(<NameTabs onNavigate={onNavigate} isWorldContributorEnabled />)

        screen.getByText(dclTabText).click()

        expect(onNavigate).toHaveBeenCalledWith(
          `${useCurrentlySelectedTabResult.pathname}?${useCurrentlySelectedTabResult.urlSearchParams.toString()}&${TAB_QUERY_PARAM_KEY}=${
            TabType.DCL
          }`
        )
      })
    })

    describe('when the ens tab is clicked', () => {
      it('should call the on navigate prop with the current pathname + the tab query param with ens as value', () => {
        render(<NameTabs onNavigate={onNavigate} isWorldContributorEnabled />)

        screen.getByText(ensTabText).click()

        expect(onNavigate).toHaveBeenCalledWith(
          `${useCurrentlySelectedTabResult.pathname}?${useCurrentlySelectedTabResult.urlSearchParams.toString()}&${TAB_QUERY_PARAM_KEY}=${
            TabType.ENS
          }`
        )
      })
    })

    describe('when the contributor tab is clicked', () => {
      it('should call the on navigate prop with the current pathname + the tab query param with contributor as value', () => {
        render(<NameTabs onNavigate={onNavigate} isWorldContributorEnabled />)

        screen.getByText(contributorTabText).click()

        expect(onNavigate).toHaveBeenCalledWith(
          `${useCurrentlySelectedTabResult.pathname}?${useCurrentlySelectedTabResult.urlSearchParams.toString()}&${TAB_QUERY_PARAM_KEY}=${
            TabType.CONTRIBUTOR
          }`
        )
      })
    })
  })
})

describe('when isWorldContributorEnabled is false', () => {
  let useCurrentlySelectedTabResult: UseCurrentlySelectedTabResult
  let onNavigate: jest.Mock

  beforeEach(() => {
    useCurrentlySelectedTabResult = {
      tab: TabType.DCL,
      pathname: '/pathname',
      urlSearchParams: new URLSearchParams('?foo=bar')
    } as UseCurrentlySelectedTabResult

    mockUseCurrentlySelectedTab.mockReturnValueOnce(useCurrentlySelectedTabResult)

    onNavigate = jest.fn()
  })

  it('should not show the contributor tab', () => {
    render(<NameTabs onNavigate={onNavigate} isWorldContributorEnabled={false} />)
    expect(screen.getByText(dclTabText)).toBeInTheDocument()
    expect(screen.getByText(ensTabText)).toBeInTheDocument()
    expect(screen.queryByText(contributorTabText)).not.toBeInTheDocument()
  })
})
