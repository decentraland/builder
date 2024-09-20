const addressBeingWrittenRegEx = /^(0x)?[0-9a-fA-F]{0,40}$/

export const includes = (addresses: string[], address: string) => {
  return addresses.some(_address => isEqual(_address, address))
}

export const isEqual = (addr1: string, addr2: string) => {
  return addr1.toLowerCase() === addr2.toLowerCase()
}

export const isZero = (addr: string) => {
  return /^0x(0)+$/.test(addr)
}

export const isValid = (addr: string) => {
  return /^0x[a-fA-F0-9]{40}$/g.test(addr)
}

export function shorten(address: string, leftChars: number = 6, rightChars: number = 5) {
  return address ? address.slice(0, leftChars) + '...' + address.slice(42 - rightChars) : ''
}

export function isAddressBeingWritten(address: string): boolean {
  return addressBeingWrittenRegEx.test(address)
}
