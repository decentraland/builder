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
  return (key: string, ...args: Parameters<T>) => {
    const timeout = timeouts[key]
    if (timeout) {
      clearTimeout(timeout)
    }
    timeouts[key] = setTimeout(() => fn(...args), ms)
  }
}
