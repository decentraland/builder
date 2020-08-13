import { createSelector } from 'reselect'
import { AtlasTile, Coord } from 'decentraland-ui'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { DeploymentState } from 'modules/deployment/reducer'
import { getTiles } from 'modules/tile/selectors'
import { FETCH_LANDS_REQUEST } from './actions'
import { coordsToId, traverseTiles, RoleColor, hasNeighbour } from './utils'
import { Land, LandType, LandTile } from './types'
import { Deployment } from 'modules/deployment/types'

export const getState = (state: RootState) => state.land
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error
export const getAuthorizations = (state: RootState) => getState(state).authorizations
export const getLands = createSelector<RootState, string | undefined, Record<string, Land[]>, Land[]>(
  getAddress,
  getData,
  (address, data) => (address && address in data ? data[address] : [])
)
export const isLoading = (state: RootState) => isLoadingType(getLoading(state), FETCH_LANDS_REQUEST)

export const getLandTiles = createSelector<RootState, Land[], Record<string, AtlasTile>, Record<string, LandTile>>(
  getLands,
  getTiles,
  (lands, tiles) => {
    const result: Record<string, LandTile> = {}
    for (const land of lands) {
      if (land.type === LandType.PARCEL) {
        const id = coordsToId(land.x!, land.y!)
        result[id] = {
          color: RoleColor[land.role],
          land
        }
      } else {
        const first = land.parcels![0]
        traverseTiles(first.x, first.y, land, result, tiles)
      }
    }
    return result
  }
)

export const getDeploymentsByCoord = createSelector<RootState, DeploymentState['data'], Record<string, Deployment>>(
  state => getDeployments(state),
  deployments => {
    const out: Record<string, Deployment> = {}
    for (const deployment of Object.values(deployments)) {
      const { parcels } = deployment
      for (const coord of parcels) {
        out[coord] = deployment
      }
    }
    return out
  }
)

export const getDeploymentsByLandId = createSelector<
  RootState,
  Record<string, LandTile>,
  Record<string, Deployment>,
  Record<string, Deployment[]>
>(getLandTiles, getDeploymentsByCoord, (tiles, deploymentsByCoord) => {
  const out: Record<string, Deployment[]> = {}
  for (const coord of Object.keys(deploymentsByCoord)) {
    const tile = tiles[coord]
    if (tile) {
      const { land } = tile
      const exists = land.id in out
      if (!exists) {
        out[land.id] = []
      }

      const deployment = deploymentsByCoord[coord]
      if (out[land.id].indexOf(deployment) === -1) {
        out[land.id].push(deployment)
      }
    }
  }
  return out
})

export const getParcelsAvailableToBuildEstates = createSelector<RootState, Record<string, LandTile>, Record<string, boolean>>(
  getLandTiles,
  landTiles => {
    const all = Object.values(landTiles)
      .filter(tile => tile.land.type === LandType.PARCEL)
      .map<Coord>(tile => ({ x: tile.land.x!, y: tile.land.y! }))
    const neighbours = Object.keys(landTiles).reduce((obj, id) => {
      const { land } = landTiles[id]
      const coord = { x: land.x!, y: land.y! }
      obj[id] = hasNeighbour(coord, all)
      return obj
    }, {} as Record<string, boolean>)
    return neighbours
  }
)
