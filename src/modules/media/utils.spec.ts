import * as UPNG from 'upng-js'
import { compressPngBlob, THUMBNAIL_PALETTE_COLORS } from './utils'

jest.mock('upng-js')

const mockedDecode = UPNG.decode as jest.MockedFunction<typeof UPNG.decode>
const mockedToRGBA8 = UPNG.toRGBA8 as jest.MockedFunction<typeof UPNG.toRGBA8>
const mockedEncode = UPNG.encode as jest.MockedFunction<typeof UPNG.encode>

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
