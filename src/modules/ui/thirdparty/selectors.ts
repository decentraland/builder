import { RootState } from 'modules/common/types'

const getState = (state: RootState) => state.ui.tpApprovalFlow

export const getProgress = (state: RootState) => getState(state).progress
