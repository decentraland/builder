import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.worlds
export const getData = (state: RootState) => getState(state).data
export const getWalletStats = (state: RootState) => getState(state).walletStats
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error

export const getConnectedWalletStats = (state: RootState) => {
  const address = getAddress(state)

  if (!address) {
    return undefined
  }

  return getWalletStats(state)[address]
}
