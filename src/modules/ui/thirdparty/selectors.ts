import { RootState } from 'modules/common/types'
import { ThirdPartyAction } from './types'

const getState = (state: RootState) => state.ui.thirdParty

export const getApprovalFlowUpdateProgress = (state: RootState) => getState(state).progress[ThirdPartyAction.APPROVE_COLLECTION]
export const getPushChangesUpdateProgress = (state: RootState) => getState(state).progress[ThirdPartyAction.PUSH_CHANGES]
