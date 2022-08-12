import { gql } from 'apollo-boost'

export const rentalFields = () => gql`
  fragment rentalFields on Rental {
    id
    tokenId
    lessor
    tenant
    operator
    startedAt
    endsAt
    ownerHasClaimedAsset
  }
`

export type RentalFields = {
  id: string
  tokenId: string
  lessor: string
  tenant: string
  operator: string
  startedAt: string
  endsAt: string
  ownerHasClaimedAsset: boolean
}
