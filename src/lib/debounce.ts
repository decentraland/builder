import { future, IFuture } from 'fp-future'

export const debounce = (fn: (...args: any[]) => void, ms: number) => {
  let timeout: any = null
  return (...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => fn(...args), ms)
  }
}

export const debounceByKey = <T extends (...args: any[]) => any>(fn: T, ms: number) => {
  const timeouts: Record<string, any> = {}
  const futures: Record<string, IFuture<void>> = {}

  return (key: string, ...args: Parameters<T>): Promise<void> => {
    const timeout = timeouts[key]
    if (timeout) {
      clearTimeout(timeout)
    }
    if (!(key in futures)) {
      futures[key] = future()
    }
    timeouts[key] = setTimeout(async () => {
      const promise = futures[key]
      if (promise !== undefined) {
        try {
          await fn(...args)
          promise.resolve()
        } catch (e) {
          promise.reject(e as Error)
        }
        delete futures[key]
      }
    }, ms)
    return futures[key]
  }
}

export const throttle = <T extends (...args: any[]) => any>(fn: T, ms: number) => {
  const timers: Record<string, number> = {}

  return (key: string, ...args: Parameters<T>) => {
    const timer = timers[key]
    const now = +Date.now()

    if (!timer || now >= timer + ms) {
      timers[key] = +Date.now()
      return fn(...args) as T
    }

    return null
  }
}
