import * as contentHash from 'content-hash'
import { env } from 'decentraland-commons'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Land } from 'modules/land/types'
import { getSelection, getCenter, getExplorerURL } from 'modules/land/utils'
import { blobToCID } from 'modules/media/utils'

export const IPFS_URL = env.get('REACT_APP_IPFS_URL', '')

const INDEX_FILE_PATH = 'index.html'

export class IpfsAPI {
  generateRedirectionFile = (land: Land): Blob => {
    const selection = getSelection(land)
    const [x, y] = getCenter(selection)
    const landURL = getExplorerURL(x, y)

    const html: string = `<html>
    <head>
      <meta
        http-equiv="refresh"
        content="0; URL=${landURL}"
      />
    </head>
    <body>
      <p>
        ${t('ipfs_api.not_redirected')}
        <a href="${landURL}">
          ${t('global.click_here')}
        </a>.
      </p>
    </body>
    </html>`

    return new Blob([html])
  }

  uploadRedirectionFile = async (land: Land): Promise<string> => {
    const formData = new FormData()
    const blob = this.generateRedirectionFile(land)
    formData.append('blob', blob, INDEX_FILE_PATH)
    const result = await fetch(IPFS_URL, {
      method: 'POST',
      body: formData
    })
    const json = await result.json()
    return json.Hash
  }

  computeLandHash = async (land: Land) => {
    const blob = this.generateRedirectionFile(land)
    const ipfsHash = await blobToCID(blob, INDEX_FILE_PATH)
    const hash = await contentHash.fromIpfs(ipfsHash)
    return hash
  }
}

export const ipfs = new IpfsAPI()
