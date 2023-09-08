import { gql } from 'apollo-boost'
import { config } from 'config'
import { createClient } from './graph'

export const MARKETPLACE_GRAPH_URL = config.get('MARKETPLACE_GRAPH_URL', '')
const marketplaceGraphClient = createClient(MARKETPLACE_GRAPH_URL)

const BATCH_SIZE = 1000

const getSubdomainQuery = () => gql`
  query getUserNames($owner: String, $offset: Int) {
    nfts(first: ${BATCH_SIZE}, skip: $offset, where: { owner: $owner, category: ens }) {
      ens {
        subdomain
      }
    }
  }
`

type SubdomainTuple = {
  ens: {
    subdomain: string[]
  }
}

type SubdomainQueryResult = {
  nfts: SubdomainTuple[]
}

export class MarketplaceAPI {
  public async fetchENSList(address: string | undefined): Promise<string[]> {
    if (!address) {
      return []
    }
    const owner: string = address.toLowerCase()
    let results: string[] = []
    let page: string[] = []
    let offset = 0
    let nextPage = true
    while (nextPage) {
      const { data } = await marketplaceGraphClient.query<SubdomainQueryResult>({
        query: getSubdomainQuery(),
        variables: { owner, offset }
      })
      page = data.nfts.map(ntf => ntf.ens.subdomain.toString())
      results = [...results, ...page]
      if (page.length === BATCH_SIZE) {
        offset += BATCH_SIZE
      } else {
        nextPage = false
      }
    }
    return results
  }
}

export const marketplace = new MarketplaceAPI()
