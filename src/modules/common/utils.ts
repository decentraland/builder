import { Task } from 'redux-saga'
import { Action } from 'redux'
import { take, fork, ActionPattern, ForkEffect, cancel } from 'redux-saga/effects'

export const takeLatestCancellable = <A extends Action>(
  { initializer, cancellable }: { initializer: ActionPattern<A>; cancellable: ActionPattern<A> },
  saga: (...args: any[]) => any,
  ...args: any[]
): ForkEffect<never> =>
  fork(function*() {
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
