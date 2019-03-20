export const locations = {
  root: () => '/',
  editor: (projectId = ':projectId') => `/editor/${projectId}`,
  signIn: () => '/sign-in',
  mobile: () => '/mobile',
  notFound: () => '/404'
}

export function isStaging() {
  return window.location.host === 'builder.decentraland.zone'
}
