import { MAX_NAME_LENGTH } from 'modules/asset/utils'

export function truncateFileName(name: string) {
  if (name.length <= MAX_NAME_LENGTH) return name
  const firstPart = name.substr(0, 4)
  const secondPart = name.substr(name.length - 5, name.length)
  return `${firstPart}...${secondPart}`
}

export function getExtension(fileName: string) {
  const matches = /\.[0-9a-z]+$/i.exec(fileName)
  const extension = matches ? matches[0] : null
  return extension
}

export function toMB(bytes: number) {
  return bytes / 1024 / 1024
}

export async function getFileSize(src: string): Promise<number> {
  try {
    const response = await fetch(src)

    if (response.ok) {
      if (src.startsWith('blob')) {
        const blob = await response.blob()
        return blob.size || 0
      } else {
        const fileSize = response.headers.get('Content-Length')
        return fileSize ? parseInt(fileSize, 10) : 0
      }
    }
  } catch (error) {
    console.error('Error retrieving file size:', error)
  }

  return 0
}
