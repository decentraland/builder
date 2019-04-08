// projecs: { project id to timestamp }
export type Contest = UserContest & {
  hasAcceptedTerms: boolean
  projects: { [projectId: string]: number }
}

export type UserContest = {
  email: string
  ethAddress: string
  upbitId: string
}
