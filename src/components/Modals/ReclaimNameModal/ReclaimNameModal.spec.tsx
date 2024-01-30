import userEvent from '@testing-library/user-event'
import { RenderResult } from '@testing-library/react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ENS } from 'modules/ens/types'
import { renderWithProviders } from 'specs/utils'
import { Props } from './ReclaimNameModal.types'
import ReclaimNameModal from './ReclaimNameModal'

function renderReclaimNameModal(props: Partial<Props> = {}) {
  return renderWithProviders(
    <ReclaimNameModal
      isLoadingReclaim={false}
      isWaitingTxReclaim={false}
      ens={{ resolver: '' } as ENS}
      error={null}
      onUnmount={jest.fn()}
      onClose={jest.fn()}
      onReclaim={jest.fn()}
      {...props}
    />
  )
}
let screen: RenderResult
let ens: ENS

beforeEach(() => {
  ens = {
    name: 'test',
    subdomain: 'test.dcl.eth',
    resolver: ''
  } as ENS
})

it('should render reclaim name title', () => {
  const screen = renderReclaimNameModal({ ens })
  expect(screen.getByText(t('ens_reclaim_name_modal.title'))).toBeInTheDocument()
})

describe('when clicking the action button', () => {
  let onReclaimNameMock: jest.Mock
  let screen: ReturnType<typeof renderReclaimNameModal>

  beforeEach(() => {
    onReclaimNameMock = jest.fn()
    screen = renderReclaimNameModal({ ens, onReclaim: onReclaimNameMock })
    const actionBtn = screen.getByRole('button', { name: t('ens_reclaim_name_modal.action') })
    userEvent.click(actionBtn)
  })

  it('should call onReclaim callback when clicking the action button', () => {
    expect(onReclaimNameMock).toHaveBeenCalledWith(ens)
  })
})

describe('when there is an error', () => {
  it('should show error message', () => {
    const screen = renderReclaimNameModal({ ens, error: 'Some error ocurr' })
    expect(screen.getByText(t('ens_reclaim_name_modal.error'))).toBeInTheDocument()
  })
})

describe('when reclaim is loading', () => {
  beforeEach(() => {
    screen = renderReclaimNameModal({ ens, isLoadingReclaim: true })
  })

  it('should show confirm transaction message', () => {
    expect(screen.getByText(t('ens_reclaim_name_modal.confirm_transaction'))).toBeInTheDocument()
  })

  it('should disable reclaim button', () => {
    const actionBtn = screen.getByRole('button', { name: t('ens_reclaim_name_modal.action') })
    expect(actionBtn).toBeDisabled()
  })
})

describe('when waiting for reclaim tx to be confirmed', () => {
  beforeEach(() => {
    screen = renderReclaimNameModal({ ens, isWaitingTxReclaim: true })
  })
  it('should show processing message', () => {
    expect(screen.getByText(t('ens_reclaim_name_modal.processing'))).toBeInTheDocument()
  })
  it('should disable reclaim button', () => {
    const actionBtn = screen.getByRole('button', { name: t('ens_reclaim_name_modal.action') })
    expect(actionBtn).toBeDisabled()
  })
})
