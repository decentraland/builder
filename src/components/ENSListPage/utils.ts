export function getCroppedAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-8)}`
}
