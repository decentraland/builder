export function difference<T = any>(left: T[], right: T[]) {
  return left.filter(x => right.indexOf(x) === -1)
}

/**
 * Filters an array by uniqueness.
 *
 * @param arr - The array to get filtered.
 */
export const uniq = <T>(arr: Array<T>): Array<T> =>
  arr.reduce((a: Array<T>, b: T) => {
    if (a.indexOf(b) < 0) a.push(b)
    return a
  }, [])
