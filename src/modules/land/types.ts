import { gql } from 'apollo-boost'
import { Tile } from 'react-tile-map/dist/lib/common'

export enum LandType {
  PARCEL = 'parcel',
  ESTATE = 'estate'
}

export enum RoleType {
  OWNER = 1,
  LESSOR = 2,
  TENANT = 3,
  OPERATOR = 4
}

export type Land = {
  id: string
  tokenId: string
  type: LandType
  roles: RoleType[]
  role: RoleType
  x?: number
  y?: number
  parcels?: { x: number; y: number; id: string }[]
  size?: number
  name: string
  description: string | null
  owner: string
  operators: string[]
}

export type Authorization = {
  address: string
  type: LandType
}

export const parcelFields = () => gql`
  fragment parcelFields on Parcel {
    x
    y
    tokenId
    owner {
      address
    }
    updateOperator
    data {
      name
      description
    }
  }
`

export type ParcelFields = {
  x: string
  y: string
  tokenId: string
  owner: {
    address: string
  }
  updateOperator: string | null
  data: {
    name: string | null
    description: string | null
  } | null
}

export const estateFields = () => gql`
  fragment estateFields on Estate {
    id
    owner {
      address
    }
    updateOperator
    size
    parcels(first: 1000) {
      x
      y
      tokenId
    }
    data {
      name
      description
    }
  }
`

export type EstateFields = {
  id: string
  owner: {
    address: string
  }
  updateOperator: string | null
  size: number
  parcels: Pick<ParcelFields, 'x' | 'y' | 'tokenId'>[]
  data: {
    name: string | null
    description: string | null
  } | null
}

export type LandTile = Tile & { land: Land }

export const rentalFields = () => gql`
  fragment rentalFields on Rental {
    id
    contractAddress
    tokenId
    lessor
    tenant
    operator
    startedAt
    endsAt
  }
`

export type RentalFields = {
  id: string
  contractAddress: string
  tokenId: string
  lessor: string
  tenant: string
  operator: string
  startedAt: string
  endsAt: string
}

export type Rental = {
  id: string
  type: LandType
  tokenId: string
  lessor: string
  tenant: string
  operator: string
  startedAt: Date
  endsAt: Date
}
