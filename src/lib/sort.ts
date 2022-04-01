export function sortByCreatedAt<T extends { createdAt?: number | string }>(a: T, b: T) {
  return new Date(a.createdAt || 0) > new Date(b.createdAt || 0) ? 1 : -1
}

export function sortByName<T extends { name: string }>(a: T, b: T) {
  return a.name.localeCompare(b.name, undefined, { numeric: true })
}
