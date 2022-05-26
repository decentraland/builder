import { WearableCategory } from '@dcl/schemas'
import { NO_CACHE_HEADERS } from 'lib/headers'
import { makeContentFile, getCID } from 'modules/deployment/utils'
import { ImageType } from './types'

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

/**
 * Converts an image blob of a wearable into a fixed 1024x1024 image encoded as data url.
 * This function also adds some padding according to the category of the wearable.
 *
 * @param blob - The blob of the image.
 * @param category - The category of the wearable.
 */
export async function convertImageIntoWearableThumbnail(blob: Blob, category: WearableCategory = WearableCategory.EYES): Promise<string> {
  // load blob into image
  const image = new Image()

  const promiseOfALoadedImage = new Promise(resolve => {
    image.onload = () => resolve(image)
  })
  image.src = await blobToDataURL(blob)
  await promiseOfALoadedImage

  let padding = 128
  switch (category) {
    case WearableCategory.EYEBROWS:
      padding = 160
      break
    case WearableCategory.MOUTH:
      padding = 160
      break
    case WearableCategory.EYES:
      padding = 128
      break
  }

  // render image into canvas, with a padding from the top. This is to center the textures into the square thumbnail.
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  canvas.style.visibility = 'hidden'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, 0, padding, canvas.width, canvas.height)

  // remove canvas
  document.body.removeChild(canvas)

  // return image
  return canvas.toDataURL()
}

/**
 * Returns the true type of an image by using the first two bytes of the image data.
 *
 * @param blob - The blob of the image.
 */
export async function getImageType(image: Blob): Promise<ImageType> {
  const dv = new DataView(await image.arrayBuffer(), 0, 5)
  var hexSixteenBytesValue = dv.getUint8(0).toString(16) + dv.getUint8(1).toString(16)

  switch (hexSixteenBytesValue) {
    case '8950':
      return ImageType.PNG
    case '4749':
      return ImageType.GIF
    case '424d':
      return ImageType.BMP
    case 'ffd8':
      return ImageType.JPEG
    default:
      return ImageType.UNKNOWN
  }
}
