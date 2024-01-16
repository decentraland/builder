export function getCroppedAddress(address?: string) {
  if (!address || address.length < 42) {
    return ''
  }
  return `${address.slice(0, 5)}...${address.slice(-6)}`
}
