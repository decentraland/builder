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

export const LAND_POOL_ADDRESS = '0xDc13378daFca7Fe2306368A16BCFac38c80BfCAD'

export const coordsToId = (x: string | number, y: string | number) => x + ',' + y

export const findDeployment = (x: string | number, y: string | number, deployments: DeploymentState['data']) => {
  for (const deployment of Object.values(deployments)) {
    if (deployment.placement.point.x === +x && deployment.placement.point.y === +y) {
      return deployment.id
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

export const getAtlasProps = (land: Land) => {
  const selection = getSelection(land)
  const [x, y] = getCenter(selection)
  return { x, y, selection }
}

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
