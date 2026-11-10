export const debounce = (fn: (...args: any[]) => void, ms: number) => {
  let timeout: any = null
  return (...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => fn(...args), ms)
  }
}
