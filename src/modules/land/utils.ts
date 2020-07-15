import { Coord } from 'react-tile-map'
import { Color } from 'decentraland-ui'
import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { DeploymentState } from 'modules/deployment/reducer'
import { LAND_REGISTRY_ADDRESS, ESTATE_REGISTRY_ADDRESS } from 'modules/common/contracts'
import { EstateRegistry } from 'contracts/EstateRegistry'
import { LANDRegistry } from 'contracts/LANDRegistry'
import { isZero } from 'lib/address'
import { Tile } from 'components/Atlas/Atlas.types'
import { Land, LandType, LandTile, RoleType } from './types'
import { ProjectState } from 'modules/project/reducer'
import { getParcelOrientation } from 'modules/project/utils'

export const LAND_POOL_ADDRESS = '0xDc13378daFca7Fe2306368A16BCFac38c80BfCAD'

export const MAX_PARCELS_PER_TX = 20

export const SEPARATOR = ','

export const coordsToId = (x: string | number, y: string | number) => x + SEPARATOR + y

export const idToCoords = (id: string) => id.split(SEPARATOR).map(coord => +coord) as [number, number]

export const isCoords = (id: string) => id.includes(SEPARATOR)

export const findDeployment = (
  x: string | number,
  y: string | number,
  deployments: DeploymentState['data'],
  projects: ProjectState['data']
) => {
  for (const deployment of Object.values(deployments)) {
    const project = projects[deployment.id]
    if (project) {
      const coords = getParcelOrientation(project, deployment.placement.point, deployment.placement.rotation)
      if (coords.some(coord => coord.x === x && coord.y === y)) {
        return deployment.id
      }
    }
  }
  return null
}

export const getCoords = (land: Land): Coord =>
  land.type === LandType.PARCEL ? { x: land.x!, y: land.y! } : { x: land.parcels![0].x!, y: land.parcels![0].y! }

export const getCenter = (selection: { x: number; y: number }[]) => {
  const xs = [...new Set(selection.map(coords => coords.x).sort())]
  const ys = [...new Set(selection.map(coords => coords.y).sort())]
  const x = xs[(xs.length / 2) | 0]
  const y = ys[(ys.length / 2) | 0]
  return [x, y]
}

export const RoleColor: Record<RoleType, string> = {
  [RoleType.OWNER]: Color.SUMMER_RED,
  [RoleType.OPERATOR]: '#1FBCFF'
}

export const traverseTiles = (x: number, y: number, land: Land, result: Record<string, LandTile>, tiles: Record<string, Tile>) => {
  const id = coordsToId(x, y)
  if (id in result) return // already processed

  const tile = tiles[id]
  if (tile && tile.estate_id === land.id) {
    result[id] = {
      color: RoleColor[land.role],
      top: tile ? !!tile.top : false,
      left: tile ? !!tile.left : false,
      topLeft: tile ? !!tile.topLeft : false,
      land
    }
    traverseTiles(x + 1, y, land, result, tiles)
    traverseTiles(x - 1, y, land, result, tiles)
    traverseTiles(x, y + 1, land, result, tiles)
    traverseTiles(x, y - 1, land, result, tiles)
  }
}

export const getSelection = (land: Land) =>
  land.type === LandType.PARCEL ? [{ x: land.x!, y: land.y! }] : land.parcels!.map(parcel => ({ x: parcel.x, y: parcel.y }))

export const getUpdateOperator = async (land: Land) => {
  const eth = Eth.fromCurrentProvider()
  if (!eth) {
    return null
  }

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
    console.log(`Error fetching updateOperator for ${land.type} ${land.id}:`, error.message)
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
