import { gql } from 'apollo-boost'
import { env } from 'decentraland-commons'
import { createClient } from './graph'
import { parcelFields, estateFields, ParcelFields, Land, LandType, RoleType, EstateFields } from 'modules/land/types'
import { coordsToId } from 'modules/land/utils'

export const PERMISSIONS_SERVER_URL = env.get('REACT_APP_PERMISSIONS_SERVER_URL', '')

const auth = createClient(PERMISSIONS_SERVER_URL)

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
      owner
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
  operatorAuthorizations: { owner: string }[]
}

const getOwnerQuery = () => gql`
  query Owner($owner: Bytes) {
    parcels(where: { estate: null, owner: $owner }) {
      ...parcelFields
    }
    estates(where: { owner: $owner }) {
      ...estateFields
    }
  }
  ${parcelFields()}
  ${estateFields()}
`

type OwnerQueryResult = {
  parcels: ParcelFields[]
  estates: EstateFields[]
}

const fromParcel = (parcel: ParcelFields, role: RoleType) => {
  const id = coordsToId(parcel.x, parcel.y)

  const result: Land = {
    id,
    name: `Parcel ${id}`,
    type: LandType.PARCEL,
    role,
    description: null,
    x: parseInt(parcel.x, 10),
    y: parseInt(parcel.y, 10),
    owner: parcel.owner,
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
    name: `Estate ${id}`,
    type: LandType.ESTATE,
    role,
    description: null,
    size: estate.size,
    parcels: estate.parcels.map(parcel => ({
      x: parseInt(parcel.x, 10),
      y: parseInt(parcel.y, 10),
      id: coordsToId(parcel.x, parcel.y)
    })),
    owner: estate.owner,
    operators: []
  }

  if (estate.updateOperator) {
    result.operators.push(estate.updateOperator)
  }

  return result
}

export class ManagerAPI {
  fetchLand = async (address: string) => {
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
    let promises = []
    for (const authorization of data.operatorAuthorizations) {
      const { owner } = authorization
      const promise = auth.query<OwnerQueryResult>({
        query: getOwnerQuery(),
        variables: {
          owner
        }
      })
      promises.push(promise)
    }
    for (const { data } of await Promise.all(promises)) {
      for (const parcel of data.parcels) {
        lands.push(fromParcel(parcel, RoleType.OPERATOR))
      }
      for (const estate of data.estates) {
        lands.push(fromEstate(estate, RoleType.OPERATOR))
      }
    }

    return lands
  }
}

export const manager = new ManagerAPI()
