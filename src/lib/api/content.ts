import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'
import { ContentManifest, ContentUploadRequestMetadata, ContentServiceFile } from 'modules/deployment/types'

export const CONTENT_SERVER_URL = env.get('REACT_APP_CONTENT_SERVER_URL', '')
export const ASSETS_CONTENT_URL = env.get('REACT_APP_ASSETS_CONTENT_URL', '')

export class ContentAPI extends BaseAPI {
  fetchValidation = async (x: number, y: number) => {
    const req = await fetch(`${this.url}/validate?x=${x}&y=${y}`)
    const res = await req.json()
    return res
  }

  uploadContent = async (
    rootCID: string,
    manifest: ContentManifest,
    metadata: ContentUploadRequestMetadata,
    files: ContentServiceFile[],
    onUploadProgress?: (progress: { loaded: number; total: number }) => void
  ) => {
    const data = new FormData()
    data.append('metadata', JSON.stringify(metadata))
    data.append(rootCID, JSON.stringify(Object.values(manifest)))

    for (let file of files) {
      const indentifier = manifest[file.path]
      let content = new Blob([file.content], {
        type: 'text/plain'
      })
      data.append(indentifier.cid, content, file.path)
    }

    try {
      await this.request('post', `/mappings`, data, {
        onUploadProgress,
        headers: {
          'x-upload-origin': 'builder'
        }
      })
    } catch (e) {
      const { status } = e.response
      if (status === 401) {
        throw new Error('Your current address is not authorized to update the specified LAND')
      } else {
        throw new Error('Unable to update LAND')
      }
    }
  }
}

export const content = new ContentAPI(CONTENT_SERVER_URL)
