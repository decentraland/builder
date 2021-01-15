import { gql } from 'apollo-boost'
import { env } from 'decentraland-commons'
import { createClient } from './graph'

export const MARKETPLACE_URL = env.get('REACT_APP_MARKETPLACE_GRAPH_URL', '')
const graphClient = createClient(MARKETPLACE_URL)

const getSubdomainQuery = () => gql`
  query getUserNames($owner: String, $offset: Int) {
    nfts(first: 1000, skip: $offset, where: { owner: $owner, category: ens }) {
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
      console.log(data.nfts.length)
      page = data.nfts.map(ntf => `${ntf.ens.subdomain}`)
      if (page.length > 0) {
        results = [...results, ...page]
        offset += 1000
      } else {
        nextPage = false
      }
    }
    console.log(results.length)
    return results
  }
}

export const marketplace = new MarketplaceAPI()
