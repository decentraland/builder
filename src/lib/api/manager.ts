import { gql } from 'apollo-boost'
import { env } from 'decentraland-commons'
import { createClient } from './graph'
import { parcelFields, estateFields, ParcelFields, Land, LandType, RoleType, EstateFields, Authorization } from 'modules/land/types'
import { coordsToId } from 'modules/land/utils'
import { isZero } from 'lib/address'
import { LAND_REGISTRY_ADDRESS, ESTATE_REGISTRY_ADDRESS } from 'modules/common/contracts'

export const LAND_MANAGER_URL = env.get('REACT_APP_LAND_MANAGER_URL', '')

const auth = createClient(LAND_MANAGER_URL)

const getLandQuery = () => gql`
  query Land($address: Bytes) {
    ownerParcels: parcels(first: 1000, where: { estate: null, owner: $address }) {
      ...parcelFields
    }
    ownerEstates: estates(first: 1000, where: { owner: $address }) {
      ...estateFields
    }
    updateOperatorParcels: parcels(first: 1000, where: { updateOperator: $address }) {
      ...parcelFields
    }
    updateOperatorEstates: estates(first: 1000, where: { updateOperator: $address }) {
      ...estateFields
    }
    ownerAuthorizations: authorizations(first: 1000, where: { owner: $address, type: "UpdateManager" }) {
      operator
      isApproved
      tokenAddress
    }
    operatorAuthorizations: authorizations(first: 1000, where: { operator: $address, type: "UpdateManager" }) {
      owner {
        address
        parcels(first: 1000, where: { estate: null }) {
          ...parcelFields
        }
        estates(first: 1000) {
          ...estateFields
        }
      }
      isApproved
      tokenAddress
    }
  }
  ${parcelFields()}
  ${estateFields()}
`

type LandQueryResult = {
  ownerParcels: ParcelFields[]
  ownerEstates: EstateFields[]
  updateOperatorParcels: ParcelFields[]
  updateOperatorEstates: EstateFields[]
  ownerAuthorizations: { operator: string; isApproved: boolean; tokenAddress: string }[]
  operatorAuthorizations: {
    owner: { address: string; parcels: ParcelFields[]; estates: EstateFields[] }
    isApproved: boolean
    tokenAddress: string
  }[]
}

const fromParcel = (parcel: ParcelFields, role: RoleType) => {
  const id = coordsToId(parcel.x, parcel.y)

  const result: Land = {
    id,
    name: (parcel.data && parcel.data.name) || `Parcel ${id}`,
    type: LandType.PARCEL,
    role,
    description: (parcel.data && parcel.data.description) || null,
    x: parseInt(parcel.x, 10),
    y: parseInt(parcel.y, 10),
    owner: parcel.owner.address,
    operators: []
  }

  if (parcel.updateOperator) {
    result.operators.push(parcel.updateOperator)
  }

  return result
}

const fromEstate = (estate: EstateFields, role: RoleType) => {
  const id = estate.id

  const result: Land = {
    id,
    name: (estate.data && estate.data.name) || `Estate ${id}`,
    type: LandType.ESTATE,
    role,
    description: (estate.data && estate.data.description) || null,
    size: estate.size,
    parcels: estate.parcels.map(parcel => ({
      x: parseInt(parcel.x, 10),
      y: parseInt(parcel.y, 10),
      id: coordsToId(parcel.x, parcel.y)
    })),
    owner: estate.owner.address,
    operators: []
  }

  if (estate.updateOperator) {
    result.operators.push(estate.updateOperator)
  }

  return result
}

export class ManagerAPI {
  fetchLand = async (_address: string): Promise<[Land[], Authorization[]]> => {
    const address = _address.toLowerCase()
    const { data } = await auth.query<LandQueryResult>({
      query: getLandQuery(),
      variables: {
        address
      }
    })

    const lands: Land[] = []
    const landUpdateManagers = new Set<string>()
    const estateUpdateManagers = new Set<string>()

    // parcels and estates that I own
    for (const parcel of data.ownerParcels) {
      lands.push(fromParcel(parcel, RoleType.OWNER))
    }
    for (const estate of data.ownerEstates) {
      lands.push(fromEstate(estate, RoleType.OWNER))
    }

    // parcels and estats that I operate
    for (const parcel of data.updateOperatorParcels) {
      lands.push(fromParcel(parcel, RoleType.OPERATOR))
    }
    for (const estate of data.updateOperatorEstates) {
      lands.push(fromEstate(estate, RoleType.OPERATOR))
    }

    // addresses I gave UpdateManager permission are operators of all my lands
    for (const authorization of data.ownerAuthorizations) {
      const { operator, isApproved, tokenAddress } = authorization
      switch (tokenAddress) {
        case LAND_REGISTRY_ADDRESS: {
          if (isApproved) {
            landUpdateManagers.add(operator)
          } else {
            landUpdateManagers.delete(operator)
          }
          break
        }
        case ESTATE_REGISTRY_ADDRESS: {
          if (isApproved) {
            estateUpdateManagers.add(operator)
          } else {
            estateUpdateManagers.delete(operator)
          }
          break
        }
      }
    }

    // I'm operator of all the lands from addresses that gave me UpdateManager permission
    for (const authorization of data.operatorAuthorizations) {
      const { owner } = authorization
      for (const parcel of owner.parcels) {
        const land = fromParcel(parcel, RoleType.OPERATOR)
        land.operators.push(address)
        // skip if already owned or operated
        if (!lands.some(_land => _land.id === land.id)) {
          lands.push(land)
        }
      }
      for (const estate of owner.estates) {
        if (estate.parcels.length > 0) {
          const land = fromEstate(estate, RoleType.OPERATOR)
          land.operators.push(address)
          // skip if already owned or operated
          if (!lands.some(_land => _land.id === land.id)) {
            lands.push(land)
          }
        }
      }
    }

    // add operators for all my lands
    let authorizations: Authorization[] = []
    for (const operator of landUpdateManagers.values()) {
      authorizations.push({ address: operator, type: LandType.PARCEL })
      const parcels = lands.filter(land => land.type === LandType.PARCEL && land.role === RoleType.OWNER)
      for (const parcel of parcels) {
        parcel.operators.push(operator)
      }
    }
    for (const operator of estateUpdateManagers.values()) {
      authorizations.push({ address: operator, type: LandType.ESTATE })
      const estates = lands.filter(land => land.type === LandType.ESTATE && land.role === RoleType.OWNER)
      for (const estate of estates) {
        estate.operators.push(operator)
      }
    }

    return [
      lands
        // remove empty estates
        .filter(land => land.type === LandType.PARCEL || land.parcels!.length > 0)
        // remove duplicated and zero address operators
        .map(land => {
          land.operators = Array.from(new Set(land.operators)).filter(address => !isZero(address))
          return land
        }),
      authorizations
    ]
  }
}

export const manager = new ManagerAPI()
