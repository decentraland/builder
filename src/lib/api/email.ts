import { env } from 'decentraland-commons'
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'

export enum EMAIL_INTEREST {
  MOBILE = 'builder-app-mobile',
  TUTORIAL = 'builder-app-tutorial',
  PUBLISH_POOL = 'builder-publish-pool',
  PUBLISH_DIRECT = 'builder-publish-direct'
}

export const EMAIL_SERVER_URL = env.get('REACT_APP_EMAIL_SERVER_URL', '')

export class EmailAPI extends BaseAPI {
  reportEmail = async (email: string, interest: EMAIL_INTEREST) => {
    await this.request('post', `/`, { email, interest })
  }
}

export const email = new EmailAPI(EMAIL_SERVER_URL)
