import { gql } from 'apollo-boost'
import { env } from 'decentraland-commons'
import { createClient } from './graph'
import { parcelFields, estateFields, ParcelFields, Land, LandType, RoleType, EstateFields } from 'modules/land/types'
import { coordsToId } from 'modules/land/utils'

export const LAND_MANAGER_URL = env.get('REACT_APP_LAND_MANAGER_URL', '')

const auth = createClient(LAND_MANAGER_URL)

const getLandQuery = () => gql`
  query Land($address: Bytes) {
    ownerParcels: parcels(where: { estate: null, owner: $address }) {
      ...parcelFields
    }
    ownerEstates: estates(where: { owner: $address }) {
      ...estateFields
    }
    updateOperatorParcels: parcels(where: { estate: null, updateOperator: $address }) {
      ...parcelFields
    }
    updateOperatorEstates: estates(where: { updateOperator: $address }) {
      ...estateFields
    }
    ownerAuthorizations: authorizations(first: 1000, where: { owner: $address, type: "UpdateManager" }) {
      operator
    }
    operatorAuthorizations: authorizations(first: 1000, where: { operator: $address, type: "UpdateManager" }) {
      owner {
        address
        parcels(where: { estate: null }) {
          ...parcelFields
        }
        estates {
          ...estateFields
        }
      }
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
  ownerAuthorizations: { operator: string }[]
  operatorAuthorizations: { owner: { address: string; parcels: ParcelFields[]; estates: EstateFields[] } }[]
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
  fetchLand = async (_address: string) => {
    const address = _address.toLowerCase()
    const { data } = await auth.query<LandQueryResult>({
      query: getLandQuery(),
      variables: {
        address
      }
    })

    const lands: Land[] = []

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
      const { operator } = authorization
      for (const land of lands) {
        land.operators.push(operator)
      }
    }

    // I'm operator of all the lands from addresses that gave me UpdateManager permission
    for (const authorization of data.operatorAuthorizations) {
      const { owner } = authorization
      for (const parcel of owner.parcels) {
        const land = fromParcel(parcel, RoleType.OPERATOR)
        land.operators.push(address)
        lands.push(land)
      }
      for (const estate of owner.estates) {
        if (estate.parcels.length > 0) {
          const land = fromEstate(estate, RoleType.OPERATOR)
          land.operators.push(address)
          lands.push(land)
        }
      }
    }

    return lands
  }
}

export const manager = new ManagerAPI()
