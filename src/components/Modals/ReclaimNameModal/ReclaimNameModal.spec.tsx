import userEvent from '@testing-library/user-event'
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

let ens: ENS
beforeEach(() => {
  ens = {
    name: 'test',
    subdomain: 'test.dcl.eth',
    resolver: ''
  } as ENS
})

it('should render reclaim name info', () => {
  const screen = renderReclaimNameModal({ ens })
  expect(screen.getByText(t('ens_reclaim_name_modal.info'))).toBeInTheDocument()
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
it('should show error message when an error ocurred', () => {
  const screen = renderReclaimNameModal({ ens, error: 'Some error ocurr' })
  expect(screen.getByText(t('ens_reclaim_name_modal.error'))).toBeInTheDocument()
})

it('should show confirm transaction message when set resolver is loading', () => {
  const screen = renderReclaimNameModal({ ens, isLoadingReclaim: true })
  expect(screen.getByText(t('ens_reclaim_name_modal.confirm_transaction'))).toBeInTheDocument()
})

it('should show processing message when set resolver tx is loading', () => {
  const screen = renderReclaimNameModal({ ens, isWaitingTxReclaim: true })
  expect(screen.getByText(t('ens_reclaim_name_modal.processing'))).toBeInTheDocument()
})
