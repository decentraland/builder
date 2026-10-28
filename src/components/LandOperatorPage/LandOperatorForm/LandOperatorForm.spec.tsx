import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resolveName } from 'decentraland-dapps/dist/components/AddressField/utils'
import { getUpdateOperator, hasAnyRole } from 'modules/land/utils'
import { Land, LandType, RoleType } from 'modules/land/types'
import LandOperatorForm from './LandOperatorForm'

jest.mock('decentraland-dapps/dist/components/AddressField/utils', () => ({ resolveName: jest.fn() }))
jest.mock('decentraland-dapps/dist/containers', () => ({
  NetworkButton: ({ children, disabled, onClick }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}))
jest.mock('react-router-dom', () => ({ Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }))
jest.mock('modules/land/utils', () => ({ getUpdateOperator: jest.fn(), hasAnyRole: jest.fn() }))

const operatorMock = getUpdateOperator as jest.MockedFunction<typeof getUpdateOperator>
const roleMock = hasAnyRole as jest.MockedFunction<typeof hasAnyRole>
const resolveMock = resolveName as jest.MockedFunction<typeof resolveName>

describe('when changing an existing LAND operator with the real AddressField', () => {
  let user: typeof userEvent
  let onSetOperator: jest.Mock
  let land: Land
  let operator: string
  let form: React.RefObject<LandOperatorForm>
  let input: HTMLElement

  beforeEach(async () => {
    user = userEvent
    operator = '0x000000000000000000000000000000000000000b'
    land = {
      id: '1',
      tokenId: '1',
      type: LandType.PARCEL,
      roles: [RoleType.OWNER],
      role: RoleType.OWNER,
      name: 'Parcel',
      description: null,
      owner: operator,
      operators: []
    }
    onSetOperator = jest.fn()
    operatorMock.mockResolvedValueOnce(operator)
    roleMock.mockReturnValue(true)
    form = React.createRef<LandOperatorForm>()
    render(<LandOperatorForm ref={form} land={land} onSetOperator={onSetOperator} />)
    input = screen.getByRole('textbox')
    await waitFor(() => expect(screen.getByRole('button', { name: /revoke/i })).toBeInTheDocument())
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.resetAllMocks()
  })

  describe.each(['edit', 'clear'])('and the user starts an %s', action => {
    beforeEach(async () => {
      jest.useFakeTimers()
      act(() => {
        user.type(input, '0x000000000000000000000000000000000000000c')
      })
      await act(async () => {
        await jest.advanceTimersByTimeAsync(800)
      })
      expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled()
      act(() => {
        if (action === 'edit') user.type(input, 'a')
        else user.clear(input)
      })
    })

    it('should disable submitting an empty recipient and ignore direct submit attempts', () => {
      expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
      form.current?.handleSetOperator()
      expect(onSetOperator).not.toHaveBeenCalled()
    })
  })

  describe('and the user explicitly revokes the operator', () => {
    beforeEach(async () => {
      act(() => {
        user.click(screen.getByRole('button', { name: /revoke/i }))
      })
      await waitFor(() => expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled())
      act(() => {
        user.click(screen.getByRole('button', { name: /submit/i }))
      })
    })

    it('should submit null to preserve the revoke action', () => {
      expect(onSetOperator).toHaveBeenCalledWith(land, null)
      expect(resolveMock).not.toHaveBeenCalled()
    })
  })
})
