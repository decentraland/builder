import { RootState } from 'modules/common/types'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { FETCH_NAMES_REQUEST } from './actions'

export const getState = (state: RootState) => state.names
export const getNames = (state: RootState) => {
  const address = '' // getAddress()
  return state.names.data[address]
}
export const isLoading = (state: RootState) => isLoadingType(getState(state).loading, FETCH_NAMES_REQUEST)
