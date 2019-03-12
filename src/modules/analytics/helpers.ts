import { env } from 'decentraland-commons'

export function reportEmail(email: string, interest: string) {
  return fetch(env.get('REACT_APP_MAIL_SERVER', ''), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      interest
    })
  })
}
