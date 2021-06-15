export function difference<T = any>(left: T[], right: T[]) {
  console.log({ left, right })
  return left.filter(x => right.indexOf(x) === -1)
}
