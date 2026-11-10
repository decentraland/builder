import { fireEvent, screen } from '@testing-library/react'
import { match } from 'react-router'
import { ENS } from 'modules/ens/types'
import { Land, LandTile, LandType, RoleType } from 'modules/land/types'
import { renderWithProviders } from 'specs/utils'
import ENSSelectLandPage from './ENSSelectLandPage'
import { Props } from './ENSSelectLandPage.types'

jest.mock('components/LoggedInDetailPage', () => ({ children }: any) => <div>{children}</div>)
jest.mock('components/Atlas', () => ({
  Atlas: ({ landId, onLocateLand }: any) => (
    <div>
      <span data-testid="atlas-selected-land">{landId ?? 'none'}</span>
      <button onClick={onLocateLand}>Locate land</button>
    </div>
  )
}))
jest.mock('react-router-dom', () => {
  const module = jest.requireActual('react-router-dom')
  return {
    ...module,
    useHistory: jest.fn(() => ({ push: jest.fn(), goBack: jest.fn() }))
  } as unknown
})

const ens: ENS = {
  name: 'test',
  subdomain: 'test.dcl.eth',
  content: '',
  ensOwnerAddress: '0xanOwner',
  nftOwnerAddress: '0xanOwner',
  resolver: '0xaResolver',
  tokenId: '',
  ensAddressRecord: ''
}

function buildLand(id: string): Land {
  return {
    id,
    tokenId: id,
    type: LandType.PARCEL,
    roles: [RoleType.OWNER],
    role: RoleType.OWNER,
    name: `Land ${id}`,
    description: null,
    owner: '0xanOwner',
    operators: []
  }
}

function renderENSSelectLandPage(props: Partial<Props>) {
  return renderWithProviders(
    <ENSSelectLandPage
      match={{ params: { subdomain: ens.subdomain } } as match<{ subdomain: string }>}
      ens={ens}
      landTiles={{}}
      isLoading={false}
      {...props}
    />
  )
}

describe('when locating a land', () => {
  describe('and the user owns no land', () => {
    beforeEach(() => {
      renderENSSelectLandPage({ landTiles: {} })
    })

    it('should not throw and keep no land selected', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Locate land' }))
      expect(screen.getByTestId('atlas-selected-land')).toHaveTextContent('none')
    })
  })

  describe('and the user owns lands', () => {
    let landTiles: Record<string, LandTile>

    beforeEach(() => {
      landTiles = {
        '0,0': { color: '', land: buildLand('0,0') },
        '1,0': { color: '', land: buildLand('1,0') }
      }
    })

    describe('and the lands are loaded while the page is still loading', () => {
      it('should select the first available land once loading ends', () => {
        const { rerender } = renderENSSelectLandPage({ landTiles, isLoading: true })
        rerender(
          <ENSSelectLandPage
            match={{ params: { subdomain: ens.subdomain } } as match<{ subdomain: string }>}
            ens={ens}
            landTiles={landTiles}
            isLoading={false}
          />
        )
        expect(screen.getByTestId('atlas-selected-land')).toHaveTextContent('0,0')
      })
    })

    describe('and a land is selected', () => {
      beforeEach(() => {
        renderENSSelectLandPage({ landTiles })
      })

      it('should select the next land', () => {
        expect(screen.getByTestId('atlas-selected-land')).toHaveTextContent('0,0')
        fireEvent.click(screen.getByRole('button', { name: 'Locate land' }))
        expect(screen.getByTestId('atlas-selected-land')).toHaveTextContent('1,0')
      })
    })
  })
})
