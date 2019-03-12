import { env } from 'decentraland-commons'

export function reportEmail(email: string) {
  return fetch(env.get('https://decentraland.org/subscribe', ''), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      interest: 'builder-app-tutorial'
    })
  })
}
