import { ValidationSeverity, combineResults } from './types'
import type { ValidationResult } from './types'

describe('combineResults', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when no results are provided', () => {
    let result: ValidationResult

    beforeEach(() => {
      result = combineResults()
    })

    it('should return an empty issues array', () => {
      expect(result.issues).toEqual([])
    })

    it('should return isValid as true', () => {
      expect(result.isValid).toBe(true)
    })
  })

  describe('when multiple results with only warnings are provided', () => {
    let result: ValidationResult

    beforeEach(() => {
      const result1: ValidationResult = {
        issues: [{ code: 'A', severity: ValidationSeverity.WARNING, messageKey: 'a' }],
        isValid: true
      }
      const result2: ValidationResult = {
        issues: [{ code: 'B', severity: ValidationSeverity.WARNING, messageKey: 'b' }],
        isValid: true
      }
      result = combineResults(result1, result2)
    })

    it('should combine all issues into a single array', () => {
      expect(result.issues).toHaveLength(2)
    })

    it('should return isValid as true', () => {
      expect(result.isValid).toBe(true)
    })
  })

  describe('when any result contains an error-severity issue', () => {
    let result: ValidationResult

    beforeEach(() => {
      const warningResult: ValidationResult = {
        issues: [{ code: 'A', severity: ValidationSeverity.WARNING, messageKey: 'a' }],
        isValid: true
      }
      const errorResult: ValidationResult = {
        issues: [{ code: 'B', severity: ValidationSeverity.ERROR, messageKey: 'b' }],
        isValid: false
      }
      result = combineResults(warningResult, errorResult)
    })

    it('should combine all issues into a single array', () => {
      expect(result.issues).toHaveLength(2)
    })

    it('should return isValid as false', () => {
      expect(result.isValid).toBe(false)
    })
  })
})
