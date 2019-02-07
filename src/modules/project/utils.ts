import { Project } from 'modules/project/types'
import { getDimensions } from 'lib/layout'

export const PARCEL_SIZE = 10 // Side size in meters

export function getProjectDimensions(project: Project): string {
  const { rows, cols } = project.parcelLayout
  return getDimensions(rows, cols)
}

export function getBlockchainParcelsFromLayout(layout: Project['parcelLayout']) {
  let out = []
  for (let y = 0; y < layout.cols; y++) {
    for (let x = 0; x < layout.rows; x++) {
      out.push({ x, y })
    }
  }
  return out
}
