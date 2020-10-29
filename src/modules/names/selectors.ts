import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { FETCH_NAMES_REQUEST } from './actions'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

export const getState = (state: RootState) => state.names
export const getNames = (state: RootState) => {
  const address = getAddress(state)
  return address ? state.names.data[address] : []
}
export const isLoading = (state: RootState) => isLoadingType(getState(state).loading, FETCH_NAMES_REQUEST)
