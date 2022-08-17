import { gql } from 'apollo-boost'
import { config } from 'config'
import fromUnixTime from 'date-fns/fromUnixTime'
import { Rental, RentalFields, rentalFields } from 'modules/land/types'
import { getLandType } from 'modules/land/utils'
import { createClient } from './graph'

export const RENTALS_GRAPH_URL = config.get('RENTALS_GRAPH_URL', '')

const rentalsGraphClient = createClient(RENTALS_GRAPH_URL)

const getRentalsByTenantQuery = () => gql`
  query Rentals($tenant: Bytes) {
    rentals(where: { tenant: $tenant, isActive: true }) {
      ...rentalFields
    }
  }
  ${rentalFields()}
`

function fromRentalFields(fields: RentalFields): Rental {
  return {
    id: fields.id,
    type: getLandType(fields.contractAddress),
    tokenId: fields.tokenId,
    lessor: fields.lessor,
    tenant: fields.tenant,
    operator: fields.operator,
    startedAt: fromUnixTime(+fields.startedAt),
    endsAt: fromUnixTime(+fields.endsAt)
  }
}

export class RentalAPI {
  fetchTokenIdsByTenant = async (address: string) => {
    const { data } = await rentalsGraphClient.query<{ rentals: RentalFields[] }>({
      query: getRentalsByTenantQuery(),
      variables: {
        tenant: address.toLowerCase()
      }
    })

    return data.rentals.map(fromRentalFields)
  }
}

export const rental = new RentalAPI()
