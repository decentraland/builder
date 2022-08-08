import { gql } from 'apollo-boost'

export const rentalFields = () => gql`
  fragment estateFields on Estate {
    id
    contractAddress
    tokenId
    lessor
    tenant
    operator
    rentalDays
    startedAt
    endsAt
    updatedAt
    pricePerDay
    sender
    ownerHasClaimedAsset
    signature
  }
`

export type RentalFields = {
  id: string
  contractAddress: string
  tokenId: string
  lessor: string
  tenant: string
  operator: string
  rentalDays: string
  startedAt: string
  endsAt: string
  updatedAt: string
  pricePerDay: string
  sender: string
  ownerHasClaimedAsset: boolean
  signature: string
}
