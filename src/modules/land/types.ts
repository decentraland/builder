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
    owner
    updateOperator
  }
`

export type ParcelFields = {
  x: string
  y: string
  tokenId: string
  owner: string
  updateOperator: string | null
}

export const estateFields = () => gql`
  fragment estateFields on Estate {
    id
    owner
    updateOperator
    size
    parcels {
      x
      y
      tokenId
    }
  }
`

export type EstateFields = {
  id: string
  owner: string
  updateOperator: string | null
  size: number
  parcels: Pick<ParcelFields, 'x' | 'y' | 'tokenId'>[]
}
