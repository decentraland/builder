import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export function createClient(url: string) {
  const link = new HttpLink({
    uri: url
  })

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache({ addTypename: false }),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache'
      }
    }
  })

  return client
}
