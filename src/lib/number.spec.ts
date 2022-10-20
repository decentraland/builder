import { formatBytes } from './number'

describe('when formating bytes', () => {
  describe('having a negative number of bytes as input', () => {
    it('should return N/A', () => {
      expect(formatBytes(-100)).toBe('N/A')
    })
  })
  describe('having 0 bytes as input', () => {
    it('should return 0 Bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
    })
  })
  describe('having 100 bytes as input', () => {
    it('should return 100 Bytes', () => {
      expect(formatBytes(100)).toBe('100 Bytes')
    })
  })
  describe('having 1024 bytes as input', () => {
    it('should return 1 KB', () => {
      expect(formatBytes(1024)).toBe('1 KB')
    })
  })
  describe('having 1234 bytes as input', () => {
    it('should return 1.2 KB', () => {
      expect(formatBytes(1234)).toBe('1.2 KB')
    })
    describe('and 2 decimal numbers', () => {
      it('should return 1.21 KB', () => {
        expect(formatBytes(1234, 2)).toBe('1.21 KB')
      })
    })
  })
  describe('having 1048576 bytes as input', () => {
    it('should return 1 MB', () => {
      expect(formatBytes(1048576)).toBe('1 MB')
    })
  })
  describe('having 1073741824 bytes as input', () => {
    it('should return 1 GB', () => {
      expect(formatBytes(1073741824)).toBe('1 GB')
    })
  })
  describe('having 1099511627776 bytes as input', () => {
    it('should return 1 TB', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB')
    })
  })
})
