import { Hashing } from 'dcl-catalyst-commons'
const toBuffer = require('blob-to-buffer')

export const FILE_NAME_BLACKLIST = ['.dclignore', 'Dockerfile', 'builder.json', 'src/game.ts']

export async function computeHashes(contents: Record<string, Blob>): Promise<Record<string, string>> {
  const contentsAsHashes: Record<string, string> = {}
  for (const path in contents) {
    const blob = contents[path]
    contentsAsHashes[path] = await computeHashFromContent(blob)
  }
  return contentsAsHashes
}

export async function computeHashFromContent(content: Blob): Promise<string> {
  const file = await makeContentFile('', content)
  return calculateBufferHash(file.content)
}

export async function calculateBufferHash(buffer: Buffer): Promise<string> {
  return Hashing.calculateBufferHash(buffer)
}

export async function makeContentFiles(files: Record<string, string | Blob>): Promise<Map<string, Buffer>> {
  const makeRequests: Promise<{ name: string; content: Buffer }>[] = []
  for (const fileName of Object.keys(files)) {
    if (FILE_NAME_BLACKLIST.includes(fileName)) continue
    makeRequests.push(makeContentFile(fileName, files[fileName]))
  }

  const contentFiles: { name: string; content: Buffer }[] = await Promise.all(makeRequests)
  return new Map(contentFiles.map(({ name, content }) => [name, content]))
}

export function makeContentFile(path: string, content: string | Blob): Promise<{ name: string; content: Buffer }> {
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
