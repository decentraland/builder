import auth0 from 'auth0-js'
import { env } from 'decentraland-commons'
import uuid from 'uuid'

import { AuthData } from './types'

export const webAuth = new auth0.WebAuth({
  clientID: env.get('REACT_APP_AUTH0_CLIENT_ID'),
  domain: env.get('REACT_APP_AUTH0_DOMAIN'),
  redirectUri: env.get('REACT_APP_AUTH0_REDIRECT'),
  responseType: 'token id_token',
  audience: env.get('REACT_APP_AUTH0_AUDIENCE'),
  scope: 'openid email'
})

export type CallbackResult = { data: AuthData; redirectUrl: string | null }

export function handleCallback(): Promise<CallbackResult> {
  return new Promise((resolve, reject) => {
    webAuth.parseHash((err, auth) => {
      if (err) {
        reject(err)
        return
      }
      if (auth && auth.accessToken && auth.idToken) {
        webAuth.client.userInfo(auth.accessToken, (err, user) => {
          if (err) {
            reject(err)
            return
          }

          let redirectUrl = null
          if (auth.state) {
            redirectUrl = localStorage.getItem(auth.state)
            if (redirectUrl) {
              localStorage.removeItem(auth.state)
            }
          }

          const data: AuthData = {
            email: user.email!,
            sub: user.sub,
            expiresAt: auth.expiresIn! * 1000 + new Date().getTime(),
            accessToken: auth.accessToken!,
            idToken: auth.idToken!
          }
          resolve({ data, redirectUrl })
        })
      } else {
        reject(new Error('No access token found in the url hash'))
      }
    })
  })
}

export function login(redirectUrl?: string) {
  let options: auth0.AuthorizeOptions = {}
  if (redirectUrl) {
    const nonce = uuid.v4()
    localStorage.setItem(nonce, redirectUrl)
    options.state = nonce
  }
  webAuth.authorize(options)
}

export function restoreSession(): Promise<AuthData> {
  return new Promise((resolve, reject) => {
    webAuth.checkSession({}, (err, auth) => {
      if (err) {
        reject(err)
        return
      }
      const result: AuthData = {
        email: auth.idTokenPayload.email,
        sub: auth.idTokenPayload.sub,
        expiresAt: auth.expiresIn! * 1000 + new Date().getTime(),
        accessToken: auth.accessToken!,
        idToken: auth.idToken!
      }
      resolve(result)
    })
  })
}

export function logout(): Promise<void> {
  return new Promise(resolve => {
    webAuth.logout({
      returnTo: window.location.origin
    })
    resolve()
  })
}

export function isTokenExpired(expiresAt: number) {
  return expiresAt > 0 && expiresAt < Date.now()
}

export function createHeaders(idToken: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`
  }
  return headers
}
