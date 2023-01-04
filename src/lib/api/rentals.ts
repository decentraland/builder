import { gql } from 'apollo-boost'
import { config } from 'config'
import fromUnixTime from 'date-fns/fromUnixTime'
import { Rental, RentalFields, rentalFields } from 'modules/land/types'
import { getLandType } from 'modules/land/utils'
import { createClient } from './graph'

export const RENTALS_GRAPH_URL = config.get('RENTALS_GRAPH_URL', '')

const rentalsGraphClient = createClient(RENTALS_GRAPH_URL)

const getRentalsQuery = () => gql`
  query Rentals($address: Bytes) {
    tenantRentals: rentals(where: { tenant: $address, isActive: true }) {
      ...rentalFields
    }
    lessorRentals: rentals(where: { lessor: $address, isActive: true }) {
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
  fetchRentalTokenIds = async (address: string): Promise<{ lessorRentals: Rental[]; tenantRentals: Rental[] }> => {
    const { data } = await rentalsGraphClient.query<{ lessorRentals: RentalFields[]; tenantRentals: RentalFields[] }>({
      query: getRentalsQuery(),
      variables: {
        address: address.toLowerCase()
      }
    })

    return {
      lessorRentals: data.lessorRentals.map(fromRentalFields),
      tenantRentals: data.tenantRentals.map(fromRentalFields)
    }
  }
}

export const rental = new RentalAPI()
