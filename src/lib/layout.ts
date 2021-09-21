import { PARCEL_SIZE } from 'modules/project/constants'

export function getDimensions(rows: number, cols: number) {
  return `${rows * PARCEL_SIZE}x${cols * PARCEL_SIZE}m`
}
