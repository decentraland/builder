import { action } from 'typesafe-actions'

// Fetch committee members

export const FETCH_COMMITTEE_MEMBERS_REQUEST = '[Request] Fetch committee members'
export const FETCH_COMMITTEE_MEMBERS_SUCCESS = '[Success] Fetch committee members'
export const FETCH_COMMITTEE_MEMBERS_FAILURE = '[Failure] Fetch committee members'

export const fetchCommitteeMembersRequest = () => action(FETCH_COMMITTEE_MEMBERS_REQUEST, {})
export const fetchCommitteeMembersSuccess = (members: string[]) => action(FETCH_COMMITTEE_MEMBERS_SUCCESS, { members })
export const fetchCommitteeMembersFailure = (error: string) => action(FETCH_COMMITTEE_MEMBERS_FAILURE, { error })

export type FetchCommitteeMembersRequestAction = ReturnType<typeof fetchCommitteeMembersRequest>
export type FetchCommitteeMembersSuccessAction = ReturnType<typeof fetchCommitteeMembersSuccess>
export type FetchCommitteeMembersFailureAction = ReturnType<typeof fetchCommitteeMembersFailure>
