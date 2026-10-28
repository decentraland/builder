import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resolveName } from 'decentraland-dapps/dist/components/AddressField/utils'
import { getMaxSupply } from 'modules/item/utils'
import { Mint } from 'modules/collection/types'
import { mockedItem } from 'specs/item'
import MintableItem from './MintableItem'

jest.mock('decentraland-dapps/dist/components/AddressField/utils', () => ({ resolveName: jest.fn() }))
jest.mock('modules/item/utils', () => ({ getMaxSupply: jest.fn() }))
jest.mock('components/ItemImage', () => () => null)
jest.mock('components/ItemStatus', () => () => null)

const resolveMock = resolveName as jest.MockedFunction<typeof resolveName>
const maxSupplyMock = getMaxSupply as jest.MockedFunction<typeof getMaxSupply>

describe('when editing a mint recipient with the real AddressField', () => {
  let user: typeof userEvent
  let onChange: jest.Mock
  let recipient: string
  let input: HTMLElement
  let blur: jest.SpyInstance

  beforeEach(() => {
    jest.useFakeTimers()
    user = userEvent
    recipient = '0x000000000000000000000000000000000000000b'
    onChange = jest.fn()
    maxSupplyMock.mockReturnValue(100)
    resolveMock.mockResolvedValue(recipient)
    function Parent() {
      const [mints, setMints] = React.useState<Partial<Mint>[]>([{ item: mockedItem, address: recipient }])
      return (
        <MintableItem
          item={mockedItem}
          mints={mints}
          onChange={(item, updated) => {
            onChange(item, updated)
            setMints(updated)
          }}
        />
      )
    }
    render(<Parent />)
    input = screen.getByRole('textbox')
    blur = jest.spyOn(input, 'blur')
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    jest.resetAllMocks()
  })

  describe('and the first edit invalidates the previous recipient', () => {
    beforeEach(() => {
      act(() => {
        user.type(input, 'a')
      })
    })

    it('should clear the recipient without blurring or inventing a mint amount while pending', () => {
      expect(onChange).toHaveBeenLastCalledWith(mockedItem, [{ item: mockedItem, address: undefined, amount: undefined }])
      expect(input).toHaveFocus()
      expect(screen.getByRole('spinbutton')).toHaveValue(null)
    })

    describe('and the next lookup returns a recipient', () => {
      beforeEach(async () => {
        await act(async () => {
          await jest.advanceTimersByTimeAsync(800)
        })
      })

      it('should default the amount and request a blur only after a recipient is resolved', () => {
        expect(onChange).toHaveBeenLastCalledWith(mockedItem, [{ item: mockedItem, address: recipient, amount: 1 }])
        expect(blur).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('and the recipient is cleared', () => {
    beforeEach(() => {
      act(() => {
        user.clear(input)
      })
    })

    it('should preserve focus and leave the amount unset', () => {
      expect(onChange).toHaveBeenLastCalledWith(mockedItem, [{ item: mockedItem, address: undefined, amount: undefined }])
      expect(input).toHaveFocus()
      expect(resolveMock).not.toHaveBeenCalled()
    })
  })
})
