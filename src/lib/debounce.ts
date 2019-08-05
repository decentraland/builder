import { future, IFuture } from 'fp-future'

export const debounce = (fn: Function, ms: number) => {
  let timeout: any = null
  return (...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => fn(...args), ms)
  }
}

export const debounceByKey = <T extends (...args: any[]) => any>(fn: T, ms: number) => {
  let timeouts: Record<string, any> = {}
  let futures: Record<string, IFuture<void>> = {}
  return (key: string, ...args: Parameters<T>): Promise<void> => {
    const timeout = timeouts[key]
    if (timeout) {
      clearTimeout(timeout)
    }
    if (!futures[key]) {
      futures[key] = future()
    }
    timeouts[key] = setTimeout(async () => {
      const promise = futures[key]
      if (promise) {
        try {
          await fn(...args)
          promise.resolve()
        } catch (e) {
          promise.reject(e.message)
        }
        delete futures[key]
      }
    }, ms)
    return futures[key]
  }
}
