import { hashV1 } from '@dcl/hashing'
import { getContentsStorageUrl } from 'lib/api/builder'
import { NO_CACHE_HEADERS } from 'lib/headers'

export const FILE_NAME_BLACKLIST = ['.dclignore', 'Dockerfile', 'builder.json', 'src/game.ts']

export async function computeHashes(contents: Record<string, Blob>): Promise<Record<string, string>> {
  const contentsAsHashes: Record<string, string> = {}
  for (const path in contents) {
    const blob = contents[path]
    const blobBuffer = await blob.arrayBuffer()
    try {
      contentsAsHashes[path] = await hashV1(new Uint8Array(blobBuffer))
    } catch (error) {
      console.error(error)
      throw error
    }
  }
  return contentsAsHashes
}

export async function computeHashFromContent(content: Blob): Promise<string> {
  const file = await makeContentFile('', content)
  return hashV1(file.content)
}

export async function makeContentFiles(files: Record<string, string | Blob>): Promise<Map<string, Buffer>> {
  const makeRequests: Promise<{ name: string; content: Buffer }>[] = []
  for (const fileName of Object.keys(files)) {
    const isEmpty = files[fileName] instanceof Blob && (files[fileName] as Blob).size === 0 // skip empty blobs, it breaks the catalyst
    if (FILE_NAME_BLACKLIST.includes(fileName) || isEmpty) continue
    makeRequests.push(makeContentFile(fileName, files[fileName]))
  }

  const contentFiles: { name: string; content: Buffer }[] = await Promise.all(makeRequests)
  return new Map(contentFiles.map(({ name, content }) => [name, content]))
}

export async function makeContentFile(path: string, content: string | Blob): Promise<{ name: string; content: Buffer }> {
  const toBuffer = (await import('blob-to-buffer')).default
  return new Promise((resolve, reject) => {
    if (typeof content === 'string') {
      const buffer = Buffer.from(content)
      resolve({ name: path, content: buffer })
    } else if (content instanceof Blob) {
      toBuffer(content, (err: Error, buffer: Buffer) => {
        if (err) reject(err)
        resolve({ name: path, content: buffer })
      })
    } else {
      reject(new Error('Unable to create ContentFile: content must be a string or a Blob'))
    }
  })
}

export async function reHashContent(oldHash: string, filePath: string): Promise<string> {
  const blob = await fetch(getContentsStorageUrl(oldHash), { headers: NO_CACHE_HEADERS }).then(resp => resp.blob())
  const file = await makeContentFile(filePath, blob)
  return hashV1(file.content)
}
