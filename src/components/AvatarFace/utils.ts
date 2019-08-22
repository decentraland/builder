export function bustCache(url?: string) {
  return url ? `${url}?${Date.now()}` : ''
}
