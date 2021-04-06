import { createSelector } from 'reselect'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'

export const getState = (state: RootState) => state.committee
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error

export const fetchCommitteeMembers = (state: RootState) => getData(state).members

export const isWalletCommitteeMember = createSelector<RootState, string[], string | undefined, boolean>(
  fetchCommitteeMembers,
  getAddress,
  (members, address = '') => members.includes(address.toLowerCase())
)
