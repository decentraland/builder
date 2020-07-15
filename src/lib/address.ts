export const isEqual = (addr1: string, addr2: string) => {
  return addr1.toLowerCase() === addr2.toLowerCase()
}

export const isZero = (addr: string) => {
  return /^0x(0)+$/.test(addr)
}

export const isValid = (addr: string) => {
  return /^0x[a-fA-F0-9]{40}$/g.test(addr)
}
