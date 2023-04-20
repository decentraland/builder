import { Task } from 'redux-saga'
import { Action } from 'redux'
import { take, fork, ActionPattern, ForkEffect, cancel } from 'redux-saga/effects'
import { RetryParams } from 'decentraland-dapps/dist/lib/api'
import { config } from 'config'

export const takeLatestCancellable = <A extends Action>(
  { initializer, cancellable }: { initializer: ActionPattern<A>; cancellable: ActionPattern<A> },
  saga: (...args: any[]) => any,
  ...args: any[]
): ForkEffect<never> =>
  fork(function* () {
    let lastTask: Task | undefined
    while (true) {
      const action: A = yield take([initializer, cancellable] as ActionPattern<Action<A>>)
      if (lastTask) {
        yield cancel(lastTask) // cancel is no-op if the task has already terminated
      }

      if (action.type === initializer) {
        lastTask = yield fork(saga, ...args.concat(action))
      }
    }
  })

// This is a temporary util fn to get a node with no Garbage collector so we can deploy profiles directly to a node
export const getPeerWithNoGBCollectorURL = () => {
  const environment = config.get('ENVIRONMENT')
  const urls =
    environment === 'production'
      ? [
          'peer-ec2.decentraland.org',
          'peer-wc1.decentraland.org',
          'peer-eu1.decentraland.org',
          'peer-ec1.decentraland.org',
          'interconnected.online',
          'peer.decentral.io',
          'peer.kyllian.me',
          'peer.uadevops.com'
        ]
      : ['peer.decentraland.zone', 'peer-ue-2.decentraland.zone', 'peer-ap1.decentraland.zone']

  return urls[Math.floor(Math.random() * urls.length)]
}

export const retryParams: RetryParams = {
  attempts: 3,
  delay: 1500
}
