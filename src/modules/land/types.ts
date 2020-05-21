import { gql } from 'apollo-boost'

export enum LandType {
  PARCEL = 'parcel',
  ESTATE = 'estate'
}

export enum RoleType {
  OWNER = 'owner',
  OPERATOR = 'operator'
}

export type Land = {
  id: string
  type: LandType
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
    parcels {
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
