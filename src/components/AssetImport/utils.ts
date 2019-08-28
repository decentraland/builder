export function getExtension(fileName: string) {
  const matches = fileName.match(/\.[0-9a-z]+$/i)
  const extension = matches ? matches[0] : null
  return extension
}

export function cleanFileName(fileName: string, extension: string) {
  const out = fileName.replace(extension, '').replace(/_/g, ' ')
  return out.charAt(0).toUpperCase() + out.slice(1)
}
