import { store } from 'modules/common/store'
import { RootState } from 'modules/common/types'
import { getAccessToken } from 'modules/auth/selectors'
import { createHeaders } from 'modules/auth/utils'

export const authorize = (accessToken?: string) => {
  const state = store.getState() as RootState
  const headers = createHeaders(accessToken || getAccessToken(state)!)
  return { headers }
}
