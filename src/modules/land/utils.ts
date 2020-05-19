import { Coord } from 'react-tile-map'
import { DeploymentState } from 'modules/deployment/reducer'
import { Land, LandType } from './types'

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
