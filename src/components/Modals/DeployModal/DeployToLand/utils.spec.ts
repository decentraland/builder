import { LandTile } from 'modules/land/types'
import { Project } from 'modules/project/types'
import { hasEnoughSpaceForScene } from './utils'

describe('hasEnoughSpaceForScene', () => {
  describe.each([
    [1, 1, ['0,1'], true],
    [1, 2, ['0,1', '0,3'], false],
    [1, 2, ['0,1', '0,2'], true],
    [1, 2, ['0,1', '1,1'], true],
    [3, 2, ['0,1', '1,1', '0,2', '0,3', '1,2', '1,3'], true],
    [3, 2, ['0,1', '1,1', '2,1', '0,2', '1,2', '2,2'], true],
    [1, 2, ['0,1'], false]
  ])('when scene layout is %sx%s and tiles are %p', (rows, cols, tiles, fits) => {
    it(`should return ${fits.toString()}`, () => {
      const project = { layout: { rows: rows, cols } } as Project
      const landTiles = tiles.reduce((tilesObj, tileKey) => {
        tilesObj[tileKey] = {} as LandTile
        return tilesObj
      }, {} as Record<string, LandTile>)
      expect(hasEnoughSpaceForScene(project, landTiles)).toBe(fits)
    })
  })
})
