import { gql } from 'apollo-boost'
import { env } from 'decentraland-commons'
import { createClient } from './graph'

export const MARKETPLACE_URL = env.get('REACT_APP_MARKETPLACE_GRAPH_URL', '')
const graphClient = createClient(MARKETPLACE_URL)

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
  fetchENSList = async (address: string | undefined): Promise<string[]> => {
    if (!address) {
      return []
    }
    const owner = address.toLowerCase()
    let results: string[] = []
    let page: string[] = []
    let offset = 0
    let nextPage = true
    while (nextPage) {
      const { data } = await graphClient.query<SubdomainQueryResult>({
        query: getSubdomainQuery(),
        variables: { owner, offset }
      })
      page = data.nfts.map(ntf => `${ntf.ens.subdomain}`)
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
