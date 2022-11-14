export function stackHandle<A, T>(
  handleFunction: (action: A) => IterableIterator<T>,
  mergeFunction: (currentAction: A, nextAction: A | null, newAction: A) => A | null,
  identifyFunction: (action: A) => string = () => ''
) {
  const stack = new Map<string, [A, A | null]>()
  return function* selfHandle(action: A): IterableIterator<T> {
    const id = identifyFunction(action)
    if (stack.has(id)) {
      const [currentAction, nextAction] = stack.get(id) as [A, A | null]
      stack.set(id, [currentAction, mergeFunction(currentAction, nextAction, action)])
      return
    } else {
      stack.set(id, [action, null])
    }

    yield* handleFunction(action)
    const [, nextAction] = stack.get(id) as [A, A | null]
    stack.delete(id)
    if (nextAction) {
      yield* selfHandle(nextAction)
    }
  }
}

export function getPagination(page: number, recordsPerPage: number) {
  page = !Number.isFinite(page) || page <= 0 ? 1 : page
  recordsPerPage = !Number.isFinite(page) || page <= 0 ? 1 : recordsPerPage

  return { limit: recordsPerPage, offset: page * recordsPerPage - recordsPerPage }
}
