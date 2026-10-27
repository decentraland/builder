import userEvent from '@testing-library/user-event'
import { RenderResult } from '@testing-library/react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ENS_RESOLVER_ADDRESS } from 'modules/common/contracts'
import { ENS } from 'modules/ens/types'
import { renderWithProviders } from 'specs/utils'
import { Props } from './ENSMapAddressModal.types'
import EnsMapAddressModal from './ENSMapAddressModal'

function renderENSMapAddressModal(props: Partial<Props> = {}) {
  return renderWithProviders(
    <EnsMapAddressModal
      isLoading={false}
      isLoadingSetResolver={false}
      ens={{ resolver: '' } as ENS}
      isWaitingTxSetResolver={false}
      error={null}
      onSave={jest.fn()}
      onUnmount={jest.fn()}
      onClose={jest.fn()}
      onSetENSResolver={jest.fn()}
      {...props}
    />
  )
}

let screen: RenderResult

describe('when the resolver is defined for the ens', () => {
  let ens: ENS
  beforeEach(() => {
    ens = {
      name: 'test',
      subdomain: 'test.dcl.eth',
      resolver: ENS_RESOLVER_ADDRESS
    } as ENS
  })

  describe('when clicking close button', () => {
    it('should call onClose callback', () => {
      const onClose = jest.fn()
      renderENSMapAddressModal({ onClose, ens })
      const closeBtn = document.querySelector('.dcl.close')
      if (closeBtn) {
        userEvent.click(closeBtn)
      }
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('when address is not defined', () => {
    it('should disable save button', () => {
      const screen = renderENSMapAddressModal({ ens })
      expect(screen.getByRole('button', { name: t('ens_map_address_modal.save') })).toBeDisabled()
    })
  })

  describe('when address is defined', () => {
    it('should call onSave when pressing save button', () => {
      const onSave = jest.fn()
      const screen = renderENSMapAddressModal({ onSave, ens })
      const addressInput = screen.getByLabelText(t('ens_map_address_modal.address.label'))
      userEvent.type(addressInput, '0xeDaE96F7739aF8A7fB16E2a888C1E578E1328299')
      const saveButton = screen.getByRole('button', { name: t('ens_map_address_modal.save') })
      userEvent.click(saveButton)
      expect(onSave).toHaveBeenCalledWith('0xeDaE96F7739aF8A7fB16E2a888C1E578E1328299')
    })
  })

  describe('when linking address is loading', () => {
    beforeEach(() => {
      screen = renderENSMapAddressModal({ isLoading: true, ens })
    })
    it('should disable save button', () => {
      expect(screen.getByRole('button', { name: t('ens_map_address_modal.save') })).toBeDisabled()
    })

    it('should disable address input', () => {
      expect(screen.getByLabelText(t('ens_map_address_modal.address.label'))).toBeDisabled()
    })

    it('should not show close icon', () => {
      const closeBtn = document.querySelector('.dcl.close')
      expect(closeBtn).toBe(null)
    })
  })

  describe('when editing an address', () => {
    beforeEach(() => {
      ens = {
        ...ens,
        ensAddressRecord: '0xtest123'
      } as ENS
      screen = renderENSMapAddressModal({ isLoading: true, ens })
    })

    it('should set the existing address as the input value', () => {
      expect(screen.getByLabelText(t('ens_map_address_modal.address.label'))).toHaveValue(ens.ensAddressRecord)
    })
  })
})

describe('when there is no resolver for the ens', () => {
  let ens: ENS
  beforeEach(() => {
    ens = {
      name: 'test',
      subdomain: 'test.dcl.eth',
      resolver: ''
    } as ENS
  })

  it('should render set resolver view', () => {
    const screen = renderENSMapAddressModal({ ens })
    expect(screen.getByText(t('ens_map_address_modal.set_resolver.title'))).toBeInTheDocument()
  })

  it('should call onSetENSResolver callback when clicking the action button', () => {
    const onSetENSResolverFn = jest.fn()
    const screen = renderENSMapAddressModal({ ens, onSetENSResolver: onSetENSResolverFn })
    const actionBtn = screen.getByRole('button', { name: t('ens_map_address_modal.set_resolver.action') })
    userEvent.click(actionBtn)
    expect(onSetENSResolverFn).toHaveBeenCalledWith(ens)
  })

  it('should show error message when an error ocurred', () => {
    const screen = renderENSMapAddressModal({ ens, error: 'Some error ocurr' })
    expect(screen.getByText(t('ens_map_address_modal.set_resolver.error'))).toBeInTheDocument()
  })

  it('should show confirm transaction message when set resolver is loading', () => {
    const screen = renderENSMapAddressModal({ ens, isLoadingSetResolver: true })
    expect(screen.getByText(t('ens_map_address_modal.confirm_transaction'))).toBeInTheDocument()
  })

  it('should show processing message when set resolver tx is loading', () => {
    const screen = renderENSMapAddressModal({ ens, isWaitingTxSetResolver: true })
    expect(screen.getByText(t('ens_map_address_modal.processing'))).toBeInTheDocument()
  })
})

describe('when the name uses a custom resolver', () => {
  let ens: ENS
  let onSetENSResolver: jest.Mock
  let confirm: jest.SpyInstance

  beforeEach(() => {
    ens = { name: 'test', subdomain: 'test.dcl.eth', resolver: '0x00000000000000000000000000000000000000aa' } as ENS
    onSetENSResolver = jest.fn()
    confirm = jest.spyOn(window, 'confirm').mockReturnValue(false)
    screen = renderENSMapAddressModal({ ens, onSetENSResolver })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should show a replacement warning without offering unsupported address editing', () => {
    expect(screen.getByText(t('ens_map_address_modal.replace_resolver.info'))).toBeInTheDocument()
    expect(screen.queryByLabelText(t('ens_map_address_modal.address.label'))).not.toBeInTheDocument()
  })

  it('should preserve the existing resolver when confirmation is cancelled', () => {
    userEvent.click(screen.getByRole('button', { name: t('ens_map_address_modal.replace_resolver.action') }))
    expect(onSetENSResolver).not.toHaveBeenCalled()
  })

  describe('and the user confirms replacement', () => {
    beforeEach(() => {
      confirm.mockReturnValueOnce(true)
    })

    it('should include the exact resolver that was confirmed', () => {
      userEvent.click(screen.getByRole('button', { name: t('ens_map_address_modal.replace_resolver.action') }))
      expect(onSetENSResolver).toHaveBeenCalledWith(ens, ens.resolver)
    })
  })
})

describe('when a resolved address refreshes while the modal is open', () => {
  let props: Props

  beforeEach(() => {
    props = {
      ens: { name: 'test', subdomain: 'test.dcl.eth', resolver: ENS_RESOLVER_ADDRESS, ensAddressRecord: '' } as ENS,
      isLoading: false,
      isLoadingSetResolver: false,
      isWaitingTxSetResolver: false,
      error: null,
      onSave: jest.fn(),
      onUnmount: jest.fn(),
      onClose: jest.fn(),
      onSetENSResolver: jest.fn()
    }
    screen = renderENSMapAddressModal(props)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should populate an untouched field with the refreshed record', () => {
    screen.rerender(<EnsMapAddressModal {...props} ens={{ ...props.ens, ensAddressRecord: 'refreshed-address' }} />)
    expect(screen.getByLabelText(t('ens_map_address_modal.address.label'))).toHaveValue('refreshed-address')
  })

  describe('and the user has started editing the address', () => {
    beforeEach(() => {
      userEvent.type(screen.getByLabelText(t('ens_map_address_modal.address.label')), 'my-new-address')
    })

    it('should preserve the user input when the same resolver refreshes', () => {
      screen.rerender(<EnsMapAddressModal {...props} ens={{ ...props.ens, ensAddressRecord: 'refreshed-address' }} />)
      expect(screen.getByLabelText(t('ens_map_address_modal.address.label'))).toHaveValue('my-new-address')
    })
  })
})

describe('when a name has no direct resolver and its content lookup failed', () => {
  let ens: ENS
  let onSetENSResolver: jest.Mock
  let confirm: jest.SpyInstance

  beforeEach(() => {
    ens = {
      name: 'test',
      subdomain: 'test.dcl.eth',
      resolver: '0x0000000000000000000000000000000000000000',
      content: '0x',
      contentLookupFailed: true
    } as ENS
    onSetENSResolver = jest.fn()
    confirm = jest.spyOn(window, 'confirm').mockReturnValueOnce(false)
    screen = renderENSMapAddressModal({ ens, onSetENSResolver })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should require confirmation because inherited records might exist', () => {
    userEvent.click(screen.getByRole('button', { name: t('ens_map_address_modal.replace_resolver.action') }))
    expect(confirm).toHaveBeenCalledWith(t('ens_map_address_modal.replace_resolver.confirm'))
    expect(onSetENSResolver).not.toHaveBeenCalled()
  })
})
