import { fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ethers } from 'ethers'
import { renderWithProviders } from 'specs/utils'
import { mockedItem } from 'specs/item'
import { fetchManaToUsdRate } from 'lib/manaRate'
import { Item, ItemType } from 'modules/item/types'
import { PriceDenomination } from 'modules/trade/denomination'
import EditPriceAndBeneficiaryModal from './EditPriceAndBeneficiaryModal'
import { Props } from './EditPriceAndBeneficiaryModal.types'

jest.mock('lib/manaRate', () => ({
  ...jest.requireActual<typeof import('lib/manaRate')>('lib/manaRate'),
  fetchManaToUsdRate: jest.fn()
}))

const CREDITS_PEG_TEXT = '1 Credit = $0.10 USD'
const FREE_CHECKBOX_TEXT = 'Make it free'

const owner = '0x24e5F44999c151f08609F8e27b2238c773C4D020'
const item = { ...mockedItem, owner, isPublished: true } as Item<ItemType.WEARABLE | ItemType.EMOTE>

const renderModal = (props: Partial<Props> = {}) =>
  renderWithProviders(
    <EditPriceAndBeneficiaryModal
      name="EditPriceAndBeneficiaryModal"
      metadata={{ itemId: item.id }}
      item={item}
      error={null}
      isLoading={false}
      isOffchainPublicItemOrdersEnabledVariants={null}
      onClose={jest.fn()}
      onSave={jest.fn()}
      onSetPriceAndBeneficiary={jest.fn()}
      {...props}
    />
  )

beforeEach(() => {
  // $0.30 per MANA, in USD wei.
  ;(fetchManaToUsdRate as jest.Mock).mockResolvedValue(ethers.BigNumber.from('300000000000000000'))
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('when the credits listing feature is off', () => {
  it('should not render the currency selector and keep the free checkbox', () => {
    const screen = renderModal({ isOffchain: true, withExpirationDate: true })
    expect(screen.queryByText(CREDITS_PEG_TEXT, { exact: false })).not.toBeInTheDocument()
    expect(screen.getByText(FREE_CHECKBOX_TEXT)).toBeInTheDocument()
  })
})

describe('when the modal is not in the off-chain flow', () => {
  it('should not render the currency selector even with the feature on', () => {
    const screen = renderModal({ isCreditsListingEnabled: true })
    expect(screen.queryByText(CREDITS_PEG_TEXT, { exact: false })).not.toBeInTheDocument()
  })
})

describe('when the credits listing feature is on in the off-chain flow', () => {
  let onSetPriceAndBeneficiary: jest.Mock
  let screen: ReturnType<typeof renderModal>

  beforeEach(() => {
    onSetPriceAndBeneficiary = jest.fn()
    screen = renderModal({ isOffchain: true, withExpirationDate: true, isCreditsListingEnabled: true, onSetPriceAndBeneficiary })
  })

  it('should pre-select credits, show the peg and keep the free checkbox available', () => {
    expect(screen.getByText(CREDITS_PEG_TEXT, { exact: false })).toBeInTheDocument()
    expect(screen.getByText(FREE_CHECKBOX_TEXT)).toBeInTheDocument()
  })

  it('should only accept whole numbers as a credits price and show its fixed USD value', () => {
    const priceInput = screen.getByPlaceholderText('10')
    userEvent.type(priceInput, '2.5')
    expect(priceInput).toHaveValue('25')
    expect(screen.getByText('= $2.50 USD', { exact: false })).toBeInTheDocument()
  })

  it('should submit the price as USD wei with the USD-pegged denomination', () => {
    userEvent.type(screen.getByPlaceholderText('10'), '6')
    userEvent.click(screen.getByText("I'm the beneficiary"))
    fireEvent.submit(document.querySelector('form')!)

    expect(onSetPriceAndBeneficiary).toHaveBeenCalledWith(
      item.id,
      '600000000000000000',
      owner,
      expect.any(Date),
      PriceDenomination.USD_PEGGED
    )
  })

  describe('and make it free is checked while in credits mode', () => {
    beforeEach(() => {
      userEvent.type(screen.getByPlaceholderText('10'), '6')
      // The "make it free" text is a sibling of the checkbox, not its label, so click the input itself.
      userEvent.click(document.querySelector('.make-it-free input')!)
    })

    it('should switch the denomination to MANA', () => {
      expect(screen.queryByText(CREDITS_PEG_TEXT, { exact: false })).not.toBeInTheDocument()
    })

    it('should submit a free MANA listing', () => {
      fireEvent.submit(document.querySelector('form')!)

      expect(onSetPriceAndBeneficiary).toHaveBeenCalledWith(
        item.id,
        '0',
        ethers.constants.AddressZero,
        expect.any(Date),
        PriceDenomination.MANA
      )
    })
  })

  describe('and the currency is switched to MANA', () => {
    beforeEach(() => {
      // The dapps Modal renders in a portal, so the modal DOM lives outside the render container.
      const dropdown = document.querySelector('.currency-dropdown') as HTMLElement
      userEvent.click(dropdown)
      userEvent.click(within(dropdown).getByRole('option', { name: 'MANA' }))
    })

    it('should clear the typed price', () => {
      expect(screen.getByPlaceholderText('100')).toHaveValue('')
    })

    it('should show the oracle-based USD estimate for a MANA price', async () => {
      userEvent.type(screen.getByPlaceholderText('100'), '100')
      expect(await screen.findByText('≈ $30.00 USD', { exact: false })).toBeInTheDocument()
    })

    it('should submit the price as MANA wei with the MANA denomination', () => {
      userEvent.type(screen.getByPlaceholderText('100'), '100')
      userEvent.click(screen.getByText("I'm the beneficiary"))
      fireEvent.submit(document.querySelector('form')!)

      expect(onSetPriceAndBeneficiary).toHaveBeenCalledWith(
        item.id,
        '100000000000000000000',
        owner,
        expect.any(Date),
        PriceDenomination.MANA
      )
    })
  })
})
