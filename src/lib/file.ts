import { MAX_NAME_LENGTH } from 'modules/asset/utils'

export function truncateFileName(name: string) {
  if (name.length <= MAX_NAME_LENGTH) return name
  const firstPart = name.substr(0, 4)
  const secondPart = name.substr(name.length - 5, name.length)
  return `${firstPart}...${secondPart}`
}

export function getExtension(fileName: string) {
  const matches = fileName.match(/\.[0-9a-z]+$/i)
  const extension = matches ? matches[0] : null
  return extension
}
