export function difference<T = any>(left: T[], right: T[]) {
  return left.filter(x => right.indexOf(x) === -1)
}

export const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))
