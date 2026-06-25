import * as UPNG from 'upng-js'
import {
  compressPngBlob,
  isPngBackgroundTransparent,
  isRgbaBackgroundTransparent,
  THUMBNAIL_PALETTE_COLORS,
  TRANSPARENT_ALPHA_THRESHOLD
} from './utils'

jest.mock('upng-js')

const mockedDecode = UPNG.decode as jest.MockedFunction<typeof UPNG.decode>
const mockedToRGBA8 = UPNG.toRGBA8 as jest.MockedFunction<typeof UPNG.toRGBA8>
const mockedEncode = UPNG.encode as jest.MockedFunction<typeof UPNG.encode>

// Builds a width x height RGBA buffer. `border` paints the outer ring, `fill` paints the interior.
function buildRgba(
  width: number,
  height: number,
  border: [number, number, number, number],
  fill: [number, number, number, number]
): Uint8Array {
  const data = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1
      const [r, g, b, a] = isBorder ? border : fill
      const offset = (y * width + x) * 4
      data[offset] = r
      data[offset + 1] = g
      data[offset + 2] = b
      data[offset + 3] = a
    }
  }
  return data
}

// Builds a deterministic Blob-like with a controlled size and arrayBuffer, avoiding reliance on jsdom internals.
function buildBlob(size: number, type = 'image/png'): Blob {
  return {
    size,
    type,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(size))
  } as unknown as Blob
}

describe('when compressing a PNG blob', () => {
  let original: Blob

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('and the quantized result is smaller than the original', () => {
    let encoded: ArrayBuffer

    beforeEach(() => {
      original = buildBlob(1024)
      encoded = new ArrayBuffer(128)
      mockedDecode.mockReturnValueOnce({ width: 1024, height: 1024 } as UPNG.Image)
      mockedToRGBA8.mockReturnValueOnce([new ArrayBuffer(4)])
      mockedEncode.mockReturnValueOnce(encoded)
    })

    it('should return a new PNG blob holding the quantized bytes', async () => {
      const result = await compressPngBlob(original)
      expect(result).not.toBe(original)
      expect(result.size).toBe(encoded.byteLength)
      expect(result.type).toBe('image/png')
    })

    it('should quantize using the default palette color count', async () => {
      await compressPngBlob(original)
      expect(mockedEncode).toHaveBeenCalledWith([expect.any(ArrayBuffer)], 1024, 1024, THUMBNAIL_PALETTE_COLORS)
    })
  })

  describe('and a custom color count is provided', () => {
    beforeEach(() => {
      original = buildBlob(1024)
      mockedDecode.mockReturnValueOnce({ width: 512, height: 512 } as UPNG.Image)
      mockedToRGBA8.mockReturnValueOnce([new ArrayBuffer(4)])
      mockedEncode.mockReturnValueOnce(new ArrayBuffer(64))
    })

    it('should quantize using the provided color count', async () => {
      await compressPngBlob(original, 64)
      expect(mockedEncode).toHaveBeenCalledWith([expect.any(ArrayBuffer)], 512, 512, 64)
    })
  })

  describe('and the quantized result is not smaller than the original', () => {
    beforeEach(() => {
      original = buildBlob(256)
      mockedDecode.mockReturnValueOnce({ width: 16, height: 16 } as UPNG.Image)
      mockedToRGBA8.mockReturnValueOnce([new ArrayBuffer(4)])
      mockedEncode.mockReturnValueOnce(new ArrayBuffer(512))
    })

    it('should return the original blob untouched by reference', async () => {
      const result = await compressPngBlob(original)
      expect(result).toBe(original)
    })
  })

  describe('and decoding the PNG throws', () => {
    beforeEach(() => {
      original = buildBlob(1024)
      mockedDecode.mockImplementationOnce(() => {
        throw new Error('invalid PNG data')
      })
    })

    it('should return the original blob untouched by reference', async () => {
      const result = await compressPngBlob(original)
      expect(result).toBe(original)
    })
  })

  describe('and the blob is not a PNG', () => {
    beforeEach(() => {
      original = buildBlob(1024, 'image/jpeg')
    })

    it('should return the original blob untouched by reference', async () => {
      const result = await compressPngBlob(original)
      expect(result).toBe(original)
    })

    it('should not attempt to decode it', async () => {
      await compressPngBlob(original)
      expect(mockedDecode).not.toHaveBeenCalled()
    })
  })
})

describe('when checking if RGBA data has a transparent background', () => {
  const opaque: [number, number, number, number] = [255, 255, 255, 255]
  const transparent: [number, number, number, number] = [0, 0, 0, 0]

  describe('and the border ring is fully transparent', () => {
    let data: Uint8Array

    beforeEach(() => {
      data = buildRgba(8, 8, transparent, opaque)
    })

    it('should report the background as transparent', () => {
      expect(isRgbaBackgroundTransparent(data, 8, 8)).toBe(true)
    })
  })

  describe('and the border ring is fully opaque', () => {
    let data: Uint8Array

    beforeEach(() => {
      data = buildRgba(8, 8, opaque, opaque)
    })

    it('should report the background as not transparent', () => {
      expect(isRgbaBackgroundTransparent(data, 8, 8)).toBe(false)
    })
  })

  describe('and the border alpha is just below the transparency threshold', () => {
    let data: Uint8Array

    beforeEach(() => {
      data = buildRgba(8, 8, [0, 0, 0, TRANSPARENT_ALPHA_THRESHOLD], opaque)
    })

    it('should report the background as transparent', () => {
      expect(isRgbaBackgroundTransparent(data, 8, 8)).toBe(true)
    })
  })

  describe('and the border alpha is just above the transparency threshold', () => {
    let data: Uint8Array

    beforeEach(() => {
      data = buildRgba(8, 8, [0, 0, 0, TRANSPARENT_ALPHA_THRESHOLD + 1], opaque)
    })

    it('should report the background as not transparent', () => {
      expect(isRgbaBackgroundTransparent(data, 8, 8)).toBe(false)
    })
  })

  describe('and only a few border pixels are opaque', () => {
    let data: Uint8Array

    beforeEach(() => {
      // A 10x10 mostly-transparent border with two opaque corner pixels stays above the ratio.
      // Alpha bytes: top-left corner (0,0) at index 3, top-right corner (9,0) at index 39.
      data = buildRgba(10, 10, transparent, opaque)
      data[3] = 255
      data[39] = 255
    })

    it('should report the background as transparent', () => {
      expect(isRgbaBackgroundTransparent(data, 10, 10)).toBe(true)
    })
  })

  describe('and the image is a single pixel', () => {
    describe('and that pixel is transparent', () => {
      let data: Uint8Array

      beforeEach(() => {
        data = buildRgba(1, 1, transparent, transparent)
      })

      it('should report the background as transparent', () => {
        expect(isRgbaBackgroundTransparent(data, 1, 1)).toBe(true)
      })
    })

    describe('and that pixel is opaque', () => {
      let data: Uint8Array

      beforeEach(() => {
        data = buildRgba(1, 1, opaque, opaque)
      })

      it('should report the background as not transparent', () => {
        expect(isRgbaBackgroundTransparent(data, 1, 1)).toBe(false)
      })
    })
  })

  describe('and the buffer is smaller than the declared dimensions', () => {
    let data: Uint8Array

    beforeEach(() => {
      data = new Uint8Array(4)
    })

    it('should report the background as transparent rather than warn on a bad input', () => {
      expect(isRgbaBackgroundTransparent(data, 8, 8)).toBe(true)
    })
  })

  describe('and the dimensions are zero', () => {
    it('should report the background as transparent', () => {
      expect(isRgbaBackgroundTransparent(new Uint8Array(0), 0, 0)).toBe(true)
    })
  })
})

describe('when checking if a PNG blob has a transparent background', () => {
  let blob: Blob

  beforeEach(() => {
    blob = { arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) } as unknown as Blob
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('and the decoded image has a transparent border', () => {
    beforeEach(() => {
      mockedDecode.mockReturnValueOnce({ width: 8, height: 8 } as UPNG.Image)
      mockedToRGBA8.mockReturnValueOnce([buildRgba(8, 8, [0, 0, 0, 0], [255, 255, 255, 255]).buffer as ArrayBuffer])
    })

    it('should report the background as transparent', async () => {
      await expect(isPngBackgroundTransparent(blob)).resolves.toBe(true)
    })
  })

  describe('and the decoded image has an opaque border', () => {
    beforeEach(() => {
      mockedDecode.mockReturnValueOnce({ width: 8, height: 8 } as UPNG.Image)
      mockedToRGBA8.mockReturnValueOnce([buildRgba(8, 8, [255, 255, 255, 255], [255, 255, 255, 255]).buffer as ArrayBuffer])
    })

    it('should report the background as not transparent', async () => {
      await expect(isPngBackgroundTransparent(blob)).resolves.toBe(false)
    })
  })

  describe('and decoding produces no frames', () => {
    beforeEach(() => {
      mockedDecode.mockReturnValueOnce({ width: 8, height: 8 } as UPNG.Image)
      mockedToRGBA8.mockReturnValueOnce([])
    })

    it('should report the background as transparent', async () => {
      await expect(isPngBackgroundTransparent(blob)).resolves.toBe(true)
    })
  })

  describe('and decoding the PNG throws', () => {
    beforeEach(() => {
      mockedDecode.mockImplementationOnce(() => {
        throw new Error('invalid PNG data')
      })
    })

    it('should report the background as transparent rather than block on a bad input', async () => {
      await expect(isPngBackgroundTransparent(blob)).resolves.toBe(true)
    })
  })
})
