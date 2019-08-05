import { store } from 'modules/common/store'
import { RootState } from 'modules/common/types'
import { getAccessToken } from 'modules/auth/selectors'
import { createHeaders } from 'modules/auth/utils'

export const authorize = () => {
  const state = store.getState() as RootState
  const accessToken = getAccessToken(state)
  const headers = accessToken ? createHeaders(accessToken) : {}
  return { headers }
}
