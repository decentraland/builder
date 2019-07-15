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
  return fetch(objectURL).then(r => r.blob())
}
