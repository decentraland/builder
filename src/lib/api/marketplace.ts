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
    const { data } = await graphClient.query<SubdomainQueryResult>({
      query: getSubdomainQuery(),
      variables: { owner }
    })
    return data.nfts.map(ntf => `${ntf.ens.subdomain}`)
  }
}

export const marketplace = new MarketplaceAPI()
