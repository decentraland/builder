import userEvent from '@testing-library/user-event'
import { RenderResult } from '@testing-library/react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ENS } from 'modules/ens/types'
import { renderWithProviders } from 'specs/utils'
import { Props } from './ENSMapAddressModal.types'
import EnsMapAddressModal from './ENSMapAddressModal'

function renderENSMapAddressModal(props: Partial<Props> = {}) {
  return renderWithProviders(
    <EnsMapAddressModal isLoading={false} error={null} onSave={jest.fn()} onClose={jest.fn()} metadata={{ ens: {} }} {...props} />
  )
}

let screen: RenderResult

describe('when clicking close button', () => {
  it('should call onClose callback', () => {
    const onClose = jest.fn()
    renderENSMapAddressModal({ onClose })
    const closeBtn = document.querySelector('.dcl.close')
    if (closeBtn) {
      userEvent.click(closeBtn)
    }
    expect(onClose).toHaveBeenCalled()
  })
})

describe('when address is not defined', () => {
  it('should disable save button', () => {
    const screen = renderENSMapAddressModal()
    expect(screen.getByRole('button', { name: t('ens_map_address_modal.save') })).toBeDisabled()
  })
})

describe('when address is defined', () => {
  it('should call onSave when pressing save button', () => {
    const onSave = jest.fn()
    const screen = renderENSMapAddressModal({ onSave })
    const addressInput = screen.getByLabelText(t('ens_map_address_modal.address.label'))
    userEvent.type(addressInput, '0xtestaddress')
    const saveButton = screen.getByRole('button', { name: t('ens_map_address_modal.save') })
    userEvent.click(saveButton)
    expect(onSave).toHaveBeenCalledWith('0xtestaddress')
  })
})

describe('when linking address is loading', () => {
  beforeEach(() => {
    screen = renderENSMapAddressModal({ isLoading: true })
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
  let ens: ENS
  beforeEach(() => {
    ens = {
      ensAddressRecord: '0xtest123'
    } as ENS
    screen = renderENSMapAddressModal({ isLoading: true, metadata: { ens } })
  })

  it('should set the existing address as the input value', () => {
    expect(screen.getByLabelText(t('ens_map_address_modal.address.label'))).toHaveValue(ens.ensAddressRecord)
  })
})
