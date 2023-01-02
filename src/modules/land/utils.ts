import { ethers } from 'ethers'
import { Coord } from 'react-tile-map'
import { Color } from 'decentraland-ui'
import { config } from 'config'
import { getSigner } from 'decentraland-dapps/dist/lib/eth'
import { LAND_REGISTRY_ADDRESS, ESTATE_REGISTRY_ADDRESS } from 'modules/common/contracts'
import { LANDRegistry__factory } from 'contracts/factories/LANDRegistry__factory'
import { EstateRegistry__factory } from 'contracts/factories/EstateRegistry__factory'
import { isZero } from 'lib/address'
import { Land, LandTile, LandType, Rental, RoleType } from './types'

export const LAND_POOL_ADDRESS = '0xDc13378daFca7Fe2306368A16BCFac38c80BfCAD'
export const MAX_PARCELS_PER_TX = 20
export const SEPARATOR = ','

export const coordsToId = (x: string | number, y: string | number) => `${x}${SEPARATOR}${y}`

export const idToCoords = (id: string) => id.split(SEPARATOR).map(coord => +coord) as [number, number]

export const isCoords = (id: string) => id.includes(SEPARATOR)

export const getCoords = (land: Land): Coord =>
  land.type === LandType.PARCEL ? { x: land.x!, y: land.y! } : { x: land.parcels![0].x, y: land.parcels![0].y }

export const getCenter = (selection: { x: number; y: number }[]) => {
  const xs = [...new Set(selection.map(coords => coords.x).sort())]
  const ys = [...new Set(selection.map(coords => coords.y).sort())]
  const x = xs[(xs.length / 2) | 0]
  const y = ys[(ys.length / 2) | 0]
  return [x, y]
}

export const colorByRole: Record<RoleType, string> = {
  [RoleType.OWNER]: Color.SUMMER_RED,
  [RoleType.LESSOR]: Color.SUMMER_RED,
  [RoleType.OPERATOR]: Color.LUISXVI_VIOLET,
  [RoleType.TENANT]: Color.SUMMER_RED
}

export const emptyColorByRole: Record<RoleType, string> = {
  [RoleType.OWNER]: '#ab2039',
  [RoleType.LESSOR]: '#ab2039',
  [RoleType.OPERATOR]: '#8f1d9b',
  [RoleType.TENANT]: '#ab2039'
}

export const selectionBorderColorByRole: Record<RoleType, string> = {
  [RoleType.OWNER]: '#ff8199',
  [RoleType.LESSOR]: '#ff8199',
  [RoleType.OPERATOR]: '#d742e8',
  [RoleType.TENANT]: '#ff8199'
}

export const hoverFillByRole = {
  [RoleType.OWNER]: '#ff8199',
  [RoleType.LESSOR]: '#ff8199',
  [RoleType.OPERATOR]: '#d742e8',
  [RoleType.TENANT]: '#ff8199'
}

export const hoverStrokeByRole = {
  [RoleType.OWNER]: '#fcc6d1',
  [RoleType.LESSOR]: '#fcc6d1',
  [RoleType.OPERATOR]: '#ef5eff',
  [RoleType.TENANT]: '#fcc6d1'
}

export const getSelection = (land: Land) =>
  land.type === LandType.PARCEL ? [{ x: land.x!, y: land.y! }] : land.parcels!.map(parcel => ({ x: parcel.x, y: parcel.y }))

export const getUpdateOperator = async (land: Land) => {
  const signer: ethers.Signer = await getSigner()

  try {
    switch (land.type) {
      case LandType.PARCEL: {
        const landRegistry = LANDRegistry__factory.connect(LAND_REGISTRY_ADDRESS, signer)
        const tokenId = await landRegistry.encodeTokenId(land.x!, land.y!)
        const updateOperator = await landRegistry.updateOperator(tokenId)
        const address = updateOperator.toString()
        return isZero(address) ? null : address
      }

      case LandType.ESTATE: {
        const estateRegistry = EstateRegistry__factory.connect(ESTATE_REGISTRY_ADDRESS, signer)
        const updateOperator = await estateRegistry.updateOperator(land.id)
        const address = updateOperator.toString()
        return isZero(address) ? null : address
      }
      default:
        return null
    }
  } catch (error) {
    return null
  }
}

export const areEqualCoords = (coord1: Coord, coord2: Coord) => coord1.x === coord2.x && coord1.y === coord2.y

export const getCoordMatcher = (coord1: Coord) => (coord2: Coord) => areEqualCoords(coord1, coord2)

export const getNeighbourMatcher = (coord1: Coord) => (coord2: Coord) =>
  (coord1.x === coord2.x && (coord1.y === coord2.y + 1 || coord1.y === coord2.y - 1)) ||
  (coord1.y === coord2.y && (coord1.x === coord2.x + 1 || coord1.x === coord2.x - 1))

export function hasNeighbour(coord: Coord, all: Coord[]) {
  return all.some(getNeighbourMatcher(coord))
}

export function getNeighbours(coord: Coord, all: Coord[]) {
  return all.filter(getNeighbourMatcher(coord))
}

const visit = (coord: Coord, all: Coord[] = [coord], visited: Coord[] = []) => {
  const isVisited = visited.some(getCoordMatcher(coord))

  if (!isVisited) {
    visited.push(coord)
    const neighbours = getNeighbours(coord, all)
    for (const neighbour of neighbours) {
      visit(neighbour, all, visited)
    }
  }
  return visited
}

export const areConnected = (coords: Coord[]) => {
  if (coords.length === 0) {
    return false
  }
  const visited = visit(coords[0], coords)
  return visited.length === coords.length
}

export const getDiff = (a: Coord[], b: Coord[]) => {
  return b.filter(coord => !a.some(getCoordMatcher(coord)))
}

export const getCoordsToAdd = (original: Coord[], modified: Coord[]) => getDiff(original, modified)
export const getCoordsToRemove = (original: Coord[], modified: Coord[]) => getDiff(modified, original)

export const splitCoords = (coords: Coord[]): [number[], number[]] => {
  const xs: number[] = []
  const ys: number[] = []
  for (const coord of coords) {
    xs.push(coord.x)
    ys.push(coord.y)
  }

  return [xs, ys]
}

export function getLandType(contractAddress: string): LandType {
  switch (contractAddress.toLowerCase()) {
    case LAND_REGISTRY_ADDRESS:
      return LandType.PARCEL
    case ESTATE_REGISTRY_ADDRESS:
      return LandType.ESTATE
    default:
      throw new Error(`Could not derive land type from contract address "${contractAddress}"`)
  }
}

export const buildMetadata = (name: string, description = '') => {
  return `0,"${name.replace(/"/g, '\\"')}","${description.replace(/"/g, '\\"')}",`
}

export function locateNextLand(landTiles: Record<string, LandTile>, currentLandId: string) {
  const landIds = Object.keys(landTiles)

  const landIndex = landIds.indexOf(currentLandId)
  const index = landIndex === -1 ? 0 : landIndex
  const nextIndex = (((index + 1) % landIds.length) + landIds.length) % landIds.length

  const nextLandId = landIds[nextIndex]
  return landTiles[nextLandId]!.land
}

export function getExplorerURL(x: string | number, y: string | number) {
  const EXPLORER_URL = config.get('EXPLORER_URL', '')
  return `${EXPLORER_URL}?position=${coordsToId(x, y)}`
}

export function hasAnyRole(land: Land, roles: RoleType[]): boolean {
  return land.roles.some(role => roles.includes(role))
}

export function hasRentalPeriodEnded(rental: Rental): boolean {
  return rental.endsAt.getTime() < Date.now()
}
