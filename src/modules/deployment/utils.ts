import path from 'path'
const CID = require('cids')
const MemoryDatastore = require('interface-datastore').MemoryDatastore
const pull = require('pull-stream')
const Importer = require('ipfs-unixfs-engine').Importer
const toBuffer = require('blob-to-buffer')

import { ContentIdentifier, ContentServiceFile, ContentManifest, Deployment, DeploymentStatus } from './types'

export async function getCID(files: ContentServiceFile[], shareRoot: boolean): Promise<string> {
  const importer = new Importer(new MemoryDatastore(), { onlyHash: true })
  return new Promise<string>((resolve, reject) => {
    pull(
      pull.values(files),
      pull.asyncMap((file: ContentServiceFile, cb: any) => {
        const data = {
          path: shareRoot ? '/tmp/' + file.path : file.path,
          content: file.content
        }
        cb(null, data)
      }),
      importer,
      pull.onEnd(() => {
        return importer.flush((err: any, content: any) => {
          if (err) {
            reject(err)
          }
          resolve(new CID(content).toBaseEncodedString())
        })
      })
    )
  })
}

export async function getFileManifest(files: ContentServiceFile[]): Promise<ContentManifest> {
  const result: Record<string, ContentIdentifier> = {}
  for (const file of files) {
    const fileCID: string = await getCID([{ path: path.basename(file.path), content: file.content, size: file.size }], false)
    result[file.path] = { cid: fileCID, name: file.path }
  }
  return result
}

export function makeContentFile(path: string, content: string | Blob): Promise<ContentServiceFile> {
  return new Promise((resolve, reject) => {
    if (typeof content === 'string') {
      const buffer = Buffer.from(content)
      resolve({ path, content: buffer, size: Buffer.byteLength(buffer) })
    } else if (content instanceof Blob) {
      toBuffer(content, (err: Error, buffer: Buffer) => {
        if (err) reject(err)
        resolve({ path, content: buffer, size: Buffer.byteLength(buffer) })
      })
    } else {
      reject(new Error('Unable to create ContentFile: content must be a string or a Blob'))
    }
  })
}

export function getStatus(deployment: Deployment) {
  if (deployment) {
    if (deployment.isDirty) return DeploymentStatus.NEEDS_SYNC
    if (deployment.lastPublishedCID) return DeploymentStatus.PUBLISHED
  }

  return DeploymentStatus.UNPUBLISHED
}
