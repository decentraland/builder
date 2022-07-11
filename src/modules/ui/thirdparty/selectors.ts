import { RootState } from 'modules/common/types'

const getState = (state: RootState) => state.ui.thirdParty

export const getApporvalFlowUpdateProgress = (state: RootState) => getState(state).approvalFlowUpdateProgress
