import { gql } from 'apollo-boost'
import { config } from 'config'
import { createClient } from './graph'
import { RentalFields, rentalFields } from 'modules/rental/types'

export const RENTALS_GRAPH_URL = config.get('RENTALS_GRAPH_URL', '')

const rentalsGraphClient = createClient(RENTALS_GRAPH_URL)

const getRentalsByTenantQuery = () => gql`
  query Rentals($tenant: Bytes, $today: BigInt!) {
    rentals(where: { tenant: $tenant, endsAt_lt: $today, ownerHasClaimedAsset: false }) {
      ...rentalFields
    }
  }
  ${rentalFields()}
`

export class RentalAPI {
  fetchTokenIdsByTenant = async (address: string) => {
    const { data } = await rentalsGraphClient.query<{ rentals: RentalFields[] }>({
      query: getRentalsByTenantQuery(),
      variables: {
        tenant: address.toLowerCase(),
        today: Math.round(Date.now() / 1000)
      }
    })

    return data.rentals
  }
}

export const rental = new RentalAPI()
