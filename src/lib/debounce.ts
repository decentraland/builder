export const debounce = (fn: Function, ms: number) => {
  let timeout: any = null
  return (...args: any[]) => {
    if (timeout != null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => fn(...args), ms)
  }
}
