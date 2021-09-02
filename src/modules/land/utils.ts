import { Coord } from 'react-tile-map'
import { env } from 'decentraland-commons'
import { Color } from 'decentraland-ui'
import { Eth } from 'web3x/eth'
import { Address } from 'web3x/address'
import { getEth } from 'modules/wallet/utils'
import { LAND_REGISTRY_ADDRESS, ESTATE_REGISTRY_ADDRESS } from 'modules/common/contracts'
import { EstateRegistry } from 'contracts/EstateRegistry'
import { LANDRegistry } from 'contracts/LANDRegistry'
import { isZero } from 'lib/address'
import { Land, LandTile, LandType, RoleType } from './types'

export const LAND_POOL_ADDRESS = '0xDc13378daFca7Fe2306368A16BCFac38c80BfCAD'
export const MAX_PARCELS_PER_TX = 20
export const SEPARATOR = ','

export const coordsToId = (x: string | number, y: string | number) => x + SEPARATOR + y

export const idToCoords = (id: string) => id.split(SEPARATOR).map(coord => +coord) as [number, number]

export const isCoords = (id: string) => id.includes(SEPARATOR)

export const getCoords = (land: Land): Coord =>
  land.type === LandType.PARCEL ? { x: land.x!, y: land.y! } : { x: land.parcels![0].x!, y: land.parcels![0].y! }

export const getCenter = (selection: { x: number; y: number }[]) => {
  const xs = [...new Set(selection.map(coords => coords.x).sort())]
  const ys = [...new Set(selection.map(coords => coords.y).sort())]
  const x = xs[(xs.length / 2) | 0]
  const y = ys[(ys.length / 2) | 0]
  return [x, y]
}

export const colorByRole: Record<RoleType, string> = {
  [RoleType.OWNER]: Color.SUMMER_RED,
  [RoleType.OPERATOR]: Color.LUISXVI_VIOLET
}

export const emptyColorByRole: Record<RoleType, string> = {
  [RoleType.OWNER]: '#ab2039',
  [RoleType.OPERATOR]: '#8f1d9b'
}

export const selectionBorderColorByRole: Record<RoleType, string> = {
  [RoleType.OWNER]: '#ff8199',
  [RoleType.OPERATOR]: '#d742e8'
}

export const hoverFillByRole = {
  [RoleType.OWNER]: '#ff8199',
  [RoleType.OPERATOR]: '#d742e8'
}

export const hoverStrokeByRole = {
  [RoleType.OWNER]: '#fcc6d1',
  [RoleType.OPERATOR]: '#ef5eff'
}

export const getSelection = (land: Land) =>
  land.type === LandType.PARCEL ? [{ x: land.x!, y: land.y! }] : land.parcels!.map(parcel => ({ x: parcel.x, y: parcel.y }))

export const getUpdateOperator = async (land: Land) => {
  const eth: Eth = await getEth()

  try {
    switch (land.type) {
      case LandType.PARCEL: {
        const landRegistry = new LANDRegistry(eth, Address.fromString(LAND_REGISTRY_ADDRESS))
        const tokenId = await landRegistry.methods.encodeTokenId(land.x!, land.y!).call()
        const updateOperator = await landRegistry.methods.updateOperator(tokenId).call()
        const address = updateOperator.toString()
        return isZero(address) ? null : address
      }

      case LandType.ESTATE: {
        const estateRegistry = new EstateRegistry(eth, Address.fromString(ESTATE_REGISTRY_ADDRESS))
        const updateOperator = await estateRegistry.methods.updateOperator(land.id).call()
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
  const EXPLORER_URL = env.get('REACT_APP_EXPLORER_URL', '')
  return `${EXPLORER_URL}?position=${coordsToId(x, y)}`
}
