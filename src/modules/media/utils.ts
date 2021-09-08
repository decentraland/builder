import { NO_CACHE_HEADERS } from 'lib/headers'
import { makeContentFile, getCID } from 'modules/deployment/utils'

export function isDataUrl(url: string): boolean {
  return url.startsWith('data:')
}

export function dataURLToBlob(dataUrl: string): Blob | null {
  const arr = dataUrl.split(',')
  const boxedMime = arr[0].match(/:(.*?);/)
  if (boxedMime) {
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new Blob([u8arr], { type: boxedMime[1] })
  }
  return null
}

export async function objectURLToBlob(objectURL: string): Promise<Blob> {
  return fetch(objectURL, { headers: NO_CACHE_HEADERS }).then(res => res.blob())
}

export async function blobToCID(blob: Blob, path: string) {
  const file = await makeContentFile(path, blob)
  const cid = await getCID([file], false)
  return cid
}

export function isRemoteURL(url: string) {
  return url.startsWith('http')
}

export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = function(e) {
      resolve((e!.target as any).result! as string)
    }
    reader.readAsDataURL(blob)
  })
}
