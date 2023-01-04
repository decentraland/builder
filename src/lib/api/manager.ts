import { gql } from 'apollo-boost'
import { config } from 'config'
import { parcelFields, estateFields, ParcelFields, Land, LandType, RoleType, EstateFields, Authorization } from 'modules/land/types'
import { coordsToId } from 'modules/land/utils'
import { isZero } from 'lib/address'
import { LAND_REGISTRY_ADDRESS, ESTATE_REGISTRY_ADDRESS } from 'modules/common/contracts'
import { createClient } from './graph'

export const LAND_MANAGER_GRAPH_URL = config.get('LAND_MANAGER_GRAPH_URL', '')

const authGraphClient = createClient(LAND_MANAGER_GRAPH_URL)

// TheGraph has a limit of a maximum of 1000 results per entity per query
const MAX_RESULTS = 1000

const getLandQuery = (skip = 0) => gql`
  query Land($address: Bytes, $tenantTokenIds: [String!], $lessorTokenIds: [String!]) {
    tenantParcels: parcels(first: ${MAX_RESULTS}, skip: ${skip}, where: { tokenId_in: $tenantTokenIds }) {
      ...parcelFields
    }
    tenantEstates: estates(first: ${MAX_RESULTS}, skip: ${skip}, where: { id_in: $tenantTokenIds }) {
      ...estateFields
    }
    lessorParcels: parcels(first: ${MAX_RESULTS}, skip: ${skip}, where: { tokenId_in: $lessorTokenIds }) {
      ...parcelFields
    }
    lessorEstates: estates(first: ${MAX_RESULTS}, skip: ${skip}, where: { id_in: $lessorTokenIds }) {
      ...estateFields
    }
    ownerParcels: parcels(first: ${MAX_RESULTS}, skip: ${skip}, where: { estate: null, owner: $address }) {
      ...parcelFields
    }
    ownerEstates: estates(first: ${MAX_RESULTS}, skip: ${skip}, where: { owner: $address }) {
      ...estateFields
    }
    updateOperatorParcels: parcels(first: ${MAX_RESULTS}, skip: ${skip}, where: { updateOperator: $address }) {
      ...parcelFields
    }
    updateOperatorEstates: estates(first: ${MAX_RESULTS}, skip: ${skip}, where: { updateOperator: $address }) {
      ...estateFields
    }
    ownerAuthorizations: authorizations(first: ${MAX_RESULTS}, skip: ${skip}, where: { owner: $address, type: "UpdateManager" }) {
      operator
      isApproved
      tokenAddress
    }
    operatorAuthorizations: authorizations(first: ${MAX_RESULTS}, skip: ${skip}, where: { operator: $address, type: "UpdateManager" }) {
      owner {
        address
        parcels(first: ${MAX_RESULTS}, skip: ${skip}, where: { estate: null }) {
          ...parcelFields
        }
        estates(first: ${MAX_RESULTS}) {
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
  tenantParcels: ParcelFields[]
  tenantEstates: EstateFields[]
  lessorParcels: ParcelFields[]
  lessorEstates: EstateFields[]
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
    tokenId: parcel.tokenId,
    name: (parcel.data && parcel.data.name) || 'Parcel',
    type: LandType.PARCEL,
    roles: [role],
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
    tokenId: id,
    name: (estate.data && estate.data.name) || `Estate ${id}`,
    type: LandType.ESTATE,
    roles: [role],
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

function isMax(result: LandQueryResult) {
  // true if any result length matches the MAX_RESULTS constant
  return Object.values(result).some(value => value.length >= MAX_RESULTS)
}

export class ManagerAPI {
  fetchLand = async (
    _address: string,
    tenantTokenIds: string[] = [],
    lessorTokenIds: string[] = [],
    skip = 0
  ): Promise<[Land[], Authorization[]]> => {
    const address = _address.toLowerCase()

    const { data } = await authGraphClient.query<LandQueryResult>({
      query: getLandQuery(skip),
      variables: {
        address,
        tenantTokenIds,
        lessorTokenIds
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

    // parcels and estates that I operate
    for (const parcel of data.updateOperatorParcels) {
      lands.push(fromParcel(parcel, RoleType.OPERATOR))
    }
    for (const estate of data.updateOperatorEstates) {
      lands.push(fromEstate(estate, RoleType.OPERATOR))
    }

    // parcels and estates that I've rented
    for (const parcel of data.tenantParcels) {
      lands.push(fromParcel(parcel, RoleType.TENANT))
    }
    for (const estate of data.tenantEstates) {
      lands.push(fromEstate(estate, RoleType.TENANT))
    }

    // parcels and estates that I've put for rent
    for (const parcel of data.lessorParcels) {
      lands.push(fromParcel(parcel, RoleType.LESSOR))
    }
    for (const estate of data.lessorEstates) {
      lands.push(fromEstate(estate, RoleType.LESSOR))
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
    const authorizations: Authorization[] = []
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

    const landsMap: Record<string, Land> = {}

    for (const land of lands) {
      // Remove empty estates
      if (land.type === LandType.ESTATE && land.parcels!.length <= 0) {
        continue
      }

      // Remove duplicated and zero address operators
      land.operators = Array.from(new Set(land.operators)).filter(address => !isZero(address))

      const savedLand = landsMap[land.id]

      if (savedLand) {
        // Update existing land roles
        savedLand.roles = [...savedLand.roles, land.role].sort()
        savedLand.role = savedLand.roles[0]
      } else {
        // Add to the total map
        landsMap[land.id] = land
      }
    }

    // check if we need to fetch more results
    if (isMax(data)) {
      // merge results recursively
      const [moreLands, moreAuthorizations] = await this.fetchLand(address, tenantTokenIds, lessorTokenIds, skip + MAX_RESULTS)
      const landResults = [...Object.values(landsMap), ...moreLands]
      const authorizationResults = [...authorizations, ...moreAuthorizations]
      return [landResults, authorizationResults]
    } else {
      return [Object.values(landsMap), authorizations]
    }
  }
}

export const manager = new ManagerAPI()
