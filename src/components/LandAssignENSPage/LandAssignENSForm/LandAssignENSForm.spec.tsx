import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ethers } from 'ethers'
import { ENS } from 'modules/ens/types'
import { Land } from 'modules/land/types'
import LandAssignENSForm from './LandAssignENSForm'
import { Props } from './LandAssignENSForm.types'

jest.mock('decentraland-dapps/dist/containers', () => ({
  NetworkButton: ({ children, onClick, disabled }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}))

describe('when assigning LAND through an unsupported resolver', () => {
  let props: Props
  let confirm: jest.SpyInstance

  beforeEach(() => {
    props = {
      ens: {
        name: 'test',
        subdomain: 'test.dcl.eth',
        resolver: '0x00000000000000000000000000000000000000aa',
        content: '0x',
        ensOwnerAddress: 'owner',
        nftOwnerAddress: 'owner'
      } as ENS,
      land: { id: 'land' } as Land,
      isLoading: false,
      isWaitingTxSetContent: false,
      isWaitingTxSetResolver: false,
      isWaitingTxReclaim: false,
      error: null,
      onSetENSResolver: jest.fn(),
      onSetENSContent: jest.fn(),
      onReclaimName: jest.fn(),
      onBack: jest.fn(),
      onNavigate: jest.fn()
    }
    confirm = jest.spyOn(window, 'confirm').mockReturnValueOnce(false)
    render(<LandAssignENSForm {...props} />)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should disable content writes to the unsupported contract', () => {
    expect(screen.getByRole('button', { name: t('global.submit') })).toBeDisabled()
  })

  it('should keep the current resolver when replacement is cancelled', () => {
    userEvent.click(screen.getByRole('button', { name: t('ens_map_address_modal.replace_resolver.action') }))
    expect(props.onSetENSResolver).not.toHaveBeenCalled()
  })

  describe('and replacement is confirmed', () => {
    beforeEach(() => {
      confirm.mockReset().mockReturnValueOnce(true)
    })

    it('should send the resolver shown at confirmation', () => {
      userEvent.click(screen.getByRole('button', { name: t('ens_map_address_modal.replace_resolver.action') }))
      expect(props.onSetENSResolver).toHaveBeenCalledWith(props.ens, props.ens.resolver)
    })
  })
})

describe('when LAND content is inherited from a parent resolver', () => {
  let props: Props

  beforeEach(() => {
    props = {
      ens: {
        name: 'test',
        subdomain: 'test.dcl.eth',
        resolver: ethers.constants.AddressZero,
        content: '0xe301',
        landId: 'land',
        ensOwnerAddress: 'owner',
        nftOwnerAddress: 'owner'
      } as ENS,
      land: { id: 'land' } as Land,
      isLoading: false,
      isWaitingTxSetContent: false,
      isWaitingTxSetResolver: false,
      isWaitingTxReclaim: false,
      error: null,
      onSetENSResolver: jest.fn(),
      onSetENSContent: jest.fn(),
      onReclaimName: jest.fn(),
      onBack: jest.fn(),
      onNavigate: jest.fn()
    }
    render(<LandAssignENSForm {...props} />)
  })

  it('should warn about masking inherited records and allow explicit replacement', () => {
    expect(screen.getByText(t('ens_map_address_modal.replace_resolver.info'))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: t('ens_map_address_modal.replace_resolver.action') })).toBeEnabled()
  })
})

describe('when assigning a name with no direct resolver or known content', () => {
  let props: Props
  let view: ReturnType<typeof render>
  let confirm: jest.SpyInstance

  beforeEach(() => {
    props = {
      ens: {
        name: 'test',
        subdomain: 'test.dcl.eth',
        resolver: ethers.constants.AddressZero,
        content: '0x',
        ensOwnerAddress: 'owner',
        nftOwnerAddress: 'owner'
      } as ENS,
      land: { id: 'land' } as Land,
      isLoading: false,
      isWaitingTxSetContent: false,
      isWaitingTxSetResolver: false,
      isWaitingTxReclaim: false,
      error: null,
      onSetENSResolver: jest.fn(),
      onSetENSContent: jest.fn(),
      onReclaimName: jest.fn(),
      onBack: jest.fn(),
      onNavigate: jest.fn()
    }
    confirm = jest.spyOn(window, 'confirm').mockReturnValueOnce(false)
    view = render(<LandAssignENSForm {...props} />)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should install a resolver normally when absence of content was verified', () => {
    userEvent.click(screen.getAllByRole('button', { name: t('global.submit') })[0])
    expect(props.onSetENSResolver).toHaveBeenCalledWith(props.ens)
    expect(confirm).not.toHaveBeenCalled()
  })

  describe('and the content lookup failed', () => {
    beforeEach(() => {
      view.rerender(<LandAssignENSForm {...props} ens={{ ...props.ens, contentLookupFailed: true }} />)
    })

    it('should warn before masking possibly inherited records', () => {
      userEvent.click(screen.getByRole('button', { name: t('ens_map_address_modal.replace_resolver.action') }))
      expect(confirm).toHaveBeenCalledWith(t('ens_map_address_modal.replace_resolver.confirm'))
      expect(props.onSetENSResolver).not.toHaveBeenCalled()
    })
  })
})
