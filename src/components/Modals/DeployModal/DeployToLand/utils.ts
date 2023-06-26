import { LandTile } from 'modules/land/types'
import { Project } from 'modules/project/types'

export function validateSizeFromAnchor(tiles: Record<string, LandTile>, anchorX: number, anchorY: number, width: number, height: number) {
  for (let x = anchorX; x < anchorX + width; x++) {
    for (let y = anchorY; y < anchorY + height; y++) {
      const coord = `${x},${y}`
      if (!tiles[coord]) {
        return false
      }
    }
  }
  return true
}

export function hasEnoughSpaceForScene(project: Project | null, landTiles: Record<string, LandTile>) {
  if (!project) {
    return false
  }

  const tiles = Object.keys(landTiles)
  const { rows, cols } = project.layout
  if (rows * cols > tiles.length) {
    return false
  }

  return tiles.some(anchor => {
    const [anchorX, anchorY] = anchor.split(',').map(n => Number(n))
    // check rowsxcols and colsxrows if they are not the same as it can also be positioned in a 90deg rotation
    if (
      validateSizeFromAnchor(landTiles, anchorX, anchorY, cols, rows) ||
      (rows !== cols && validateSizeFromAnchor(landTiles, anchorX, anchorY, rows, cols))
    ) {
      return true
    }
    return false
  })
}
