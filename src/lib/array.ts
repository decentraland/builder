export function difference<T = any>(left: T[], right: T[]) {
  return left.filter(x => right.indexOf(x) === -1)
}
