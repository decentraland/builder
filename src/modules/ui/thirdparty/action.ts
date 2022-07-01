import { action } from 'typesafe-actions'

// TP Approval Flow
export const APPROVAL_FLOW_UPDATE_PROGRESS = '[Update progress] Approval flow '

export const updateApprovalFlowProgress = (progress: number) => action(APPROVAL_FLOW_UPDATE_PROGRESS, { progress })

export type UpdateApporvalFlowProgressAction = ReturnType<typeof updateApprovalFlowProgress>
