import { RootState } from 'modules/common/types'
import { createSelector } from 'reselect'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Land } from './types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { FETCH_LAND_REQUEST } from './actions'

export const getState = (state: RootState) => state.land
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error
export const getLand = createSelector<RootState, string | undefined, Record<string, Land[]>, Land[]>(getAddress, getData, (address, data) =>
  address && address in data ? data[address] : []
)
export const isLoading = (state: RootState) => isLoadingType(getLoading(state), FETCH_LAND_REQUEST)
