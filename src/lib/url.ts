export function getSafeExternalUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
      return undefined
    }
    return parsed.href
  } catch {
    return undefined
  }
}

export function openExternal(url?: string | null): void {
  const safeUrl = getSafeExternalUrl(url)
  if (safeUrl) {
    window.open(safeUrl, '_blank', 'noopener,noreferrer')
  }
}
