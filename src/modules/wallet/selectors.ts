import { createSelector } from 'reselect'
import { getData } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { RootState } from 'modules/common/types'

export const getWallet = createSelector<RootState, Wallet | null, Wallet | null>(getData, wallet =>
  wallet ? { ...wallet, address: wallet.address.toLowerCase() } : null
)
