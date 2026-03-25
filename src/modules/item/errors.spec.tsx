import { ValidationSeverity } from 'lib/glbValidation/types'
import type { ValidationIssue } from 'lib/glbValidation/types'
import { GLBValidationError, CustomErrorWithTitle } from './errors'

describe('GLBValidationError', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when constructed with a mix of errors and warnings', () => {
    let error: GLBValidationError
    let allIssues: ValidationIssue[]

    beforeEach(() => {
      allIssues = [
        { code: 'TRIANGLE_COUNT_EXCEEDED', severity: ValidationSeverity.ERROR, messageKey: 'error.triangles' },
        { code: 'LEAF_BONES_FOUND', severity: ValidationSeverity.WARNING, messageKey: 'warning.bones' },
        { code: 'MATERIALS_EXCEEDED', severity: ValidationSeverity.ERROR, messageKey: 'error.materials' }
      ]
      error = new GLBValidationError(allIssues)
    })

    it('should be an instance of CustomErrorWithTitle', () => {
      expect(error).toBeInstanceOf(CustomErrorWithTitle)
    })

    it('should store all issues including warnings', () => {
      expect(error.issues).toHaveLength(3)
    })

    it('should have a title', () => {
      expect(error.title).toBeDefined()
    })

    it('should have a message', () => {
      expect(error.message).toBeDefined()
    })
  })

  describe('when constructed with only warnings', () => {
    let error: GLBValidationError

    beforeEach(() => {
      const issues: ValidationIssue[] = [{ code: 'LEAF_BONES_FOUND', severity: ValidationSeverity.WARNING, messageKey: 'warning.bones' }]
      error = new GLBValidationError(issues)
    })

    it('should still store the issues', () => {
      expect(error.issues).toHaveLength(1)
    })
  })

  describe('when constructed with an empty array', () => {
    let error: GLBValidationError

    beforeEach(() => {
      error = new GLBValidationError([])
    })

    it('should store an empty issues array', () => {
      expect(error.issues).toEqual([])
    })
  })
})
