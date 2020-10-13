import { env } from 'decentraland-commons'
import { Land } from 'modules/land/types'
import { getSelection, getCenter, coordsToId } from 'modules/land/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

export const IPFS_URL = env.get('REACT_APP_IPFS_URL', '')
export const LAND_POSITION_URL = env.get('REACT_APP_LAND_POSITION_URL', '')

export class IpfsAPI {
  uploadRedirectionFile = async (land: Land): Promise<string> => {
    const selection = getSelection(land)
    const [x, y] = getCenter(selection)

    const formData = new FormData()

    const html: string = `<html>
    <head>
      <meta
        http-equiv="refresh"
        content="0; URL=${LAND_POSITION_URL}${coordsToId(x, y)}"
      />
    </head>
    <body>
      <p>
        ${t('land_ens_page.not_redirected')}
        <a href="${LAND_POSITION_URL}${coordsToId(x, y)}">
          ${t('global.click_here')}
        </a>.
      </p>
    </body>
    </html>`

    console.log({ html })
    formData.append('blob', new Blob([html]), 'index.html')
    const result = await fetch(IPFS_URL, {
      method: 'POST',
      body: formData
    })
    const json = await result.json()

    return json.Hash
  }
}

export const ipfs = new IpfsAPI()
