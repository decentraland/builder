import { config } from 'config'
import { gql } from 'apollo-boost'
import { createClient } from './graph'

export const ENS_SUBGRAPH_URL = config.get('ENS_SUBGRAPH_URL', '')
const ensGraphClient = createClient(ENS_SUBGRAPH_URL)

type Domain = { name: string }
type DomainsQueryResult = { data: { domains: Domain[] } } | { errors: any }

type OwnerByENSTuple = {
  name: string
  wrappedOwner: {
    id: string
  }
}

type OwnerByENSQueryResult = {
  domains: OwnerByENSTuple[]
}

const FAIL_TO_FETCH_ENS_LIST_MESSAGE = 'Failed to fetch ENS list'

const getOwnerByENSQuery = () => gql`
  query getOwners($domains: [String]) {
    domains(where: { name_in: $domains }) {
      name
      wrappedOwner {
        id
      }
    }
  }
`

export class ENSApi {
  constructor(private subgraph: string) {}

  /**
   * Will fetch all ens domains owned by the given address.
   */
  fetchExternalNames = async (owner: string): Promise<string[]> => {
    const lowercasedOwner = owner.toLowerCase()

    let response: Response

    try {
      response = await fetch(this.subgraph, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            {
              domains(
                where: {or: [{wrappedOwner: "${lowercasedOwner}"}, {registrant: "${lowercasedOwner}"}]}
              ) {
                name
              }
            }
          `
        })
      })
    } catch (e) {
      throw new Error(`${FAIL_TO_FETCH_ENS_LIST_MESSAGE} - ${(e as Error).message}`)
    }

    if (!response.ok) {
      throw new Error(`${FAIL_TO_FETCH_ENS_LIST_MESSAGE} - ${response.status}`)
    }

    const queryResult: DomainsQueryResult = await response.json()

    if ('errors' in queryResult) {
      throw new Error(`${FAIL_TO_FETCH_ENS_LIST_MESSAGE} - ${JSON.stringify(queryResult.errors)}`)
    }

    return queryResult.data.domains.map(domain => domain.name)
  }

  fetchExternalENSOwners = async (domains: string[]): Promise<Record<string, string>> => {
    const { data } = await ensGraphClient.query<OwnerByENSQueryResult>({
      query: getOwnerByENSQuery(),
      variables: { domains }
    })

    const results: Record<string, string> = {}
    data.domains.forEach(({ wrappedOwner, name }) => {
      results[name] = wrappedOwner.id
    })

    return results
  }
}
