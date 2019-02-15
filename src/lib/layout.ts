import { PARCEL_SIZE } from 'modules/project/utils'

export function getDimensions(rows: number, cols: number) {
  return `${cols * PARCEL_SIZE}x${rows * PARCEL_SIZE}m`
}
