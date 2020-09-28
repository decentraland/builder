import { env } from 'decentraland-commons'
import { Land } from 'modules/land/types'
import { getSelection, getCenter, coordsToId } from 'modules/land/utils'

export const IPFS_URL = env.get('REACT_APP_IPFS_URL', '')


export class IpfsAPI {
  uploadRedirectionFile = async (land: Land): Promise<string> => {
    const selection = getSelection(land)
    const [x, y] = getCenter(selection)

    const formData = new FormData()

    const html:string = `<html>
    <head>
      <meta 
        http-equiv="refresh" 
        content="0; URL=https://play.decentraland.org?position=${coordsToId(x, y)}" 
      />
    </head>
    <body>
      <p>
        If you are not redirected 
        <a href="https://play.decentraland.org?position=${coordsToId(x, y)}">click here</a>.
      </p>
    </body>
    </html>`

    formData.append('blob', new Blob([html]), 'index.html')
    const result = await fetch(IPFS_URL , {
      method: 'POST',
      body: formData
    })
    const json = await result.json()


    return json.Hash
  }
}

export const ipfs = new IpfsAPI()
