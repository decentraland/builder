import { gql } from 'apollo-boost'
import { config } from 'config'
import { createClient } from './graph'
import { BaseAPI } from 'decentraland-dapps/dist/lib'

export const MARKETPLACE_GRAPH_URL = config.get('MARKETPLACE_GRAPH_URL', '')
const marketplaceGraphClient = createClient(MARKETPLACE_GRAPH_URL)
const BATCH_SIZE = 1000

const getSubdomainQuery = () => gql`
  query getUserNames($owner: String, $first: Int, $skip: Int) {
    nfts(first: $first, skip: $skip, where: { owner_: { id: $owner }, category: ens }) {
      ens {
        subdomain
      }
    }
  }
`

const getOwnerByNameQuery = () => gql`
  query getOwners($domains: [String!], $offset: Int) {
    nfts(first: ${BATCH_SIZE}, skip: $offset, where: { name_in: $domains, category: ens }) {
      owner {
        address
      }
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

type OwnerByNameTuple = {
  owner: {
    address: string
  }
  ens: {
    subdomain: string
  }
}
type OwnerByNameQueryResult = {
  nfts: OwnerByNameTuple[]
}

export class MarketplaceAPI extends BaseAPI {
  public async fetchENSOwnerByDomain(domains: string[]): Promise<Record<string, string>> {
    if (!domains) {
      return {}
    }

    const results: Record<string, string> = {}
    let offset = 0
    let nextPage = true
    while (nextPage) {
      const { data } = await marketplaceGraphClient.query<OwnerByNameQueryResult>({
        query: getOwnerByNameQuery(),
        variables: { domains, offset }
      })
      data.nfts.forEach(({ ens, owner }) => {
        results[ens.subdomain] = owner.address
      })
      if (data.nfts.length === BATCH_SIZE) {
        offset += BATCH_SIZE
      } else {
        nextPage = false
      }
    }
    return results
  }

  public async fetchENSList(address: string | undefined, first: number = 20, skip: number = 0): Promise<string[]> {
    if (!address) {
      return []
    }
    const owner: string = address.toLowerCase()
    const { data } = await marketplaceGraphClient.query<SubdomainQueryResult>({
      query: getSubdomainQuery(),
      variables: { owner, first, skip }
    })
    return data.nfts.map(ntf => ntf.ens.subdomain.toString())
  }

  public async fetchENSListCount(address: string | undefined): Promise<number> {
    if (!address) {
      return 0
    }
    const owner: string = address.toLowerCase()
    let count = 0
    let offset = 0
    let nextPage = true
    while (nextPage) {
      const { data } = await marketplaceGraphClient.query<SubdomainQueryResult>({
        query: getSubdomainQuery(),
        variables: { owner, first: BATCH_SIZE, skip: offset }
      })
      count += data.nfts.length
      if (data.nfts.length === BATCH_SIZE) {
        offset += BATCH_SIZE
      } else {
        nextPage = false
      }
    }
    return count
  }

  public async fetchCollectionItems(collectionAddress: string) {
    return this.request('get', `/items?contractAddress=${collectionAddress}`)
  }
}

export const marketplace = new MarketplaceAPI(config.get('MARKETPLACE_API'))
