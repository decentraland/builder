import { createSelector } from 'reselect'
import { AtlasTile, Coord } from 'decentraland-ui'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { getData as getProjects } from 'modules/project/selectors'
import { DeploymentState } from 'modules/deployment/reducer'
import { getTiles } from 'modules/tile/selectors'
import { FETCH_LANDS_REQUEST } from './actions'
import { findDeployment as findProjectIdByCoords, coordsToId, traverseTiles, RoleColor, hasNeighbour } from './utils'
import { Land, LandType, LandTile } from './types'
import { ProjectState } from 'modules/project/reducer'
import { Project } from 'modules/project/types'

export const getState = (state: RootState) => state.land
export const getData = (state: RootState) => getState(state).data
export const getLoading = (state: RootState) => getState(state).loading
export const getError = (state: RootState) => getState(state).error
export const getLands = createSelector<RootState, string | undefined, Record<string, Land[]>, Land[]>(
  getAddress,
  getData,
  (address, data) => (address && address in data ? data[address] : [])
)
export const isLoading = (state: RootState) => isLoadingType(getLoading(state), FETCH_LANDS_REQUEST)

export const getProjectIdsByLand = createSelector<
  RootState,
  Land[],
  ProjectState['data'],
  DeploymentState['data'],
  Record<string, string[]>
>(
  getLands,
  state => getProjects(state),
  state => getDeployments(state),
  (lands, projects, deployments) => {
    let results: Record<string, string[]> = {}

    for (const land of lands) {
      results[land.id] = []
      if (land.type === LandType.PARCEL) {
        const found = findProjectIdByCoords(land.x!, land.y!, deployments, projects)
        if (found && !results[land.id].includes(found)) {
          results[land.id].push(found)
        }
      } else {
        for (const parcel of land.parcels!) {
          const found = findProjectIdByCoords(parcel.x!, parcel.y!, deployments, projects)
          if (found && !results[land.id].includes(found)) {
            results[land.id].push(found)
          }
        }
      }
    }

    return results
  }
)

export const getProjectsByLand = createSelector<RootState, Record<string, string[]>, ProjectState['data'], Record<string, Project[]>>(
  getProjectIdsByLand,
  getProjects,
  (projectIdsByLand, projectData) =>
    Object.keys(projectIdsByLand).reduce((obj, landId) => {
      const projectIds = projectIdsByLand[landId]
      obj[landId] = projectIds.filter(id => id in projectData).map(id => projectData[id])
      return obj
    }, {} as Record<string, Project[]>)
)

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
