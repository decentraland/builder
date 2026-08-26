import { drawTile, getGradientColors } from './utils'

describe('when getting the gradient colors of a name', () => {
  let colors: string[]

  describe('and the name length is inside the shortest range', () => {
    beforeEach(() => {
      colors = getGradientColors(3)
    })

    it('should return the purple gradient', () => {
      expect(colors).toEqual(['#C640CD', '#691FA9'])
    })
  })

  describe('and the name length is inside the longest range', () => {
    beforeEach(() => {
      colors = getGradientColors(15)
    })

    it('should return the red gradient', () => {
      expect(colors).toEqual(['#FF9EB1', '#FF2D55'])
    })
  })

  describe('and the name is shorter than every range', () => {
    beforeEach(() => {
      colors = getGradientColors(1)
    })

    it('should return the default black and white gradient', () => {
      expect(colors).toEqual(['#000000', '#FFFFFF'])
    })
  })

  describe('and the name is longer than every range', () => {
    beforeEach(() => {
      colors = getGradientColors(16)
    })

    it('should return the default black and white gradient', () => {
      expect(colors).toEqual(['#000000', '#FFFFFF'])
    })
  })
})

describe('when drawing the tile', () => {
  let canvas: HTMLCanvasElement
  let originalWidth: number

  beforeEach(() => {
    canvas = document.createElement('canvas')
    originalWidth = canvas.width
  })

  describe('and the canvas is not being displayed', () => {
    beforeEach(async () => {
      await drawTile(canvas, 'aName')
    })

    it('should leave the canvas backing store untouched', () => {
      expect(canvas.width).toBe(originalWidth)
    })
  })
})
