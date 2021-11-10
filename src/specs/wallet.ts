import { RootState } from 'modules/common/types'

export function addWalletToState(state: RootState, address: string): RootState {
  return {
    ...state,
    wallet: {
      ...(state.wallet ?? {}),
      data: {
        address: '0x0'
      } as any
    }
  }
}
