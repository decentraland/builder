import { createSelector } from 'reselect'
import { AtlasTile, Color } from 'decentraland-ui'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { getData as getDeployments } from 'modules/deployment/selectors'
import { DeploymentState } from 'modules/deployment/reducer'
import { getTiles } from 'modules/tile/selectors'
import { FETCH_LANDS_REQUEST } from './actions'
import { findDeployment, coordsToId, traverseTiles } from './utils'
import { Land, LandType, LandTile } from './types'

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

export const getProjectIdsByLand = createSelector<RootState, Land[], DeploymentState['data'], Record<string, string[]>>(
  getLands,
  getDeployments,
  (lands, deployments) => {
    let results: Record<string, string[]> = {}

    for (const land of lands) {
      results[land.id] = []
      if (land.type === LandType.PARCEL) {
        const found = findDeployment(land.x!, land.y!, deployments)
        if (found) {
          results[land.id].push(found)
        }
      } else {
        for (const parcel of land.parcels!) {
          const found = findDeployment(parcel.x!, parcel.y!, deployments)
          if (found) {
            results[land.id].push(found)
          }
        }
      }
    }

    return results
  }
)

export const getUserTiles = createSelector<RootState, Land[], Record<string, AtlasTile>, Record<string, LandTile>>(
  getLands,
  getTiles,
  (lands, tiles) => {
    const result: Record<string, LandTile> = {}
    for (const land of lands) {
      if (land.type === LandType.PARCEL) {
        const id = coordsToId(land.x!, land.y!)
        result[id] = {
          color: Color.SUMMER_RED,
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
