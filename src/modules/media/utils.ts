import { hashV1 } from '@dcl/hashing'
import { WearableCategory } from '@dcl/schemas'
import * as UPNG from 'upng-js'
import { NO_CACHE_HEADERS } from 'lib/headers'
import { makeContentFile, getCID } from 'modules/deployment/utils'
import { ImageType } from './types'

/**
 * Number of colors used to quantize PNG thumbnails into an indexed palette.
 * 256 is the maximum for an 8-bit palette — the highest-fidelity quantization,
 * which minimizes banding while still shrinking the file substantially. Lower it
 * to trade quality for smaller files.
 */
export const THUMBNAIL_PALETTE_COLORS = 256

export function isDataUrl(url: string): boolean {
  return url.startsWith('data:')
}

export function dataURLToBlob(dataUrl: string): Blob | null {
  const arr = dataUrl.split(',')
  const boxedMime = /:(.*?);/.exec(arr[0])
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

export async function blobToHash(blob: Blob, path: string) {
  const file = await makeContentFile(path, blob)
  return hashV1(file.content)
}

export async function blobToCID(blob: Blob, path: string) {
  const file = await makeContentFile(path, blob)
  return getCID([file])
}

export function isRemoteURL(url: string) {
  return url.startsWith('http')
}

export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = function (e) {
      resolve((e.target as any).result! as string)
    }
    reader.readAsDataURL(blob)
  })
}

/**
 * Compresses a PNG blob by re-encoding it with a quantized (indexed) palette. Unlike JPEG/WebP
 * this preserves the alpha channel, so it is safe for the transparent thumbnails the builder
 * generates while greatly reducing the file size of 3D-rendered images.
 *
 * This is a dependency-light alternative to a true pngquant quality floor: there is no perceptual
 * threshold, so it relies on a *size floor* instead. If the quantized result is not smaller than the
 * original (e.g. smooth gradients that quantize poorly), or if decoding/encoding fails for any
 * reason, the original blob is returned **by reference** — callers can treat `result === input` as
 * "left untouched" (e.g. to skip recomputing its content hash). Non-PNG blobs are returned as-is.
 *
 * @param blob - The PNG blob to compress.
 * @param colors - Max number of palette colors (1-256). Fewer colors = smaller file, more banding.
 */
export async function compressPngBlob(blob: Blob, colors: number = THUMBNAIL_PALETTE_COLORS): Promise<Blob> {
  // Only PNGs can be quantized this way; leave anything else (or unknown types) untouched.
  if (blob.type && blob.type !== 'image/png') {
    return blob
  }

  try {
    const buffer = await blob.arrayBuffer()
    const image = UPNG.decode(buffer)
    const frames = UPNG.toRGBA8(image)
    const encoded = UPNG.encode(frames, image.width, image.height, colors)
    const compressed = new Blob([encoded], { type: 'image/png' })
    // Size floor: never replace the original with a larger (or empty) result.
    return compressed.size > 0 && compressed.size < blob.size ? compressed : blob
  } catch {
    // Compression must never break thumbnail creation/upload — fall back to the original.
    return blob
  }
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
  const hexSixteenBytesValue = dv.getUint8(0).toString(16) + dv.getUint8(1).toString(16)

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

/**
 * An alpha value (0-255) at or below this threshold is treated as transparent. Slightly above 0
 * to tolerate near-transparent edge pixels produced by anti-aliasing / lossless re-encoding.
 */
export const TRANSPARENT_ALPHA_THRESHOLD = 8

/**
 * Fraction of sampled border pixels that must be transparent for the background to be considered
 * transparent. Logos/badges occasionally bleed into a corner, so we don't require every border
 * pixel to be transparent.
 */
export const TRANSPARENT_BORDER_RATIO = 0.9

/**
 * Determines whether an RGBA image has a transparent background by sampling its border ring (the
 * outermost row/column of pixels on each edge). The marketplace renders the item's rarity color
 * behind the thumbnail, so a non-transparent background hides that color and is the single most
 * common thumbnail rejection reason in curation. This is a cheap, dependency-free heuristic: a
 * thumbnail whose subject is centered will have a fully transparent border when exported correctly.
 *
 * @param rgba - Raw RGBA pixel data, 4 bytes per pixel (length must be `width * height * 4`).
 * @param width - Image width in pixels.
 * @param height - Image height in pixels.
 * @returns `true` when the border is (mostly) transparent, `false` otherwise. Images too small to
 *   sample are treated as transparent (no signal, never warn).
 */
export function isRgbaBackgroundTransparent(rgba: Uint8Array | Uint8ClampedArray | number[], width: number, height: number): boolean {
  if (width <= 0 || height <= 0 || rgba.length < width * height * 4) {
    return true
  }

  const alphaAt = (x: number, y: number): number => rgba[(y * width + x) * 4 + 3]

  let sampled = 0
  let transparent = 0
  const sample = (x: number, y: number): void => {
    sampled++
    if (alphaAt(x, y) <= TRANSPARENT_ALPHA_THRESHOLD) {
      transparent++
    }
  }

  // Sample the top and bottom rows.
  for (let x = 0; x < width; x++) {
    sample(x, 0)
    if (height > 1) {
      sample(x, height - 1)
    }
  }
  // Sample the left and right columns, skipping the corners already sampled above.
  for (let y = 1; y < height - 1; y++) {
    sample(0, y)
    if (width > 1) {
      sample(width - 1, y)
    }
  }

  if (sampled === 0) {
    return true
  }

  return transparent / sampled >= TRANSPARENT_BORDER_RATIO
}

/**
 * Decodes a PNG blob and checks whether its background is transparent via
 * {@link isRgbaBackgroundTransparent}. Uses UPNG (already a dependency) so it works without a
 * canvas, including in tests. Any decode failure is treated as transparent so the check can never
 * block or wrongly warn on an unexpected input.
 *
 * @param blob - The PNG blob to inspect.
 */
export async function isPngBackgroundTransparent(blob: Blob): Promise<boolean> {
  try {
    const buffer = await blob.arrayBuffer()
    const image = UPNG.decode(buffer)
    const [frame] = UPNG.toRGBA8(image)
    if (!frame) {
      return true
    }
    return isRgbaBackgroundTransparent(new Uint8Array(frame), image.width, image.height)
  } catch {
    return true
  }
}
