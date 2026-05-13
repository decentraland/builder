import { ReactElement } from 'react'
import { ValidationSeverity } from 'lib/glbValidation/types'
import type { ValidationIssue } from 'lib/glbValidation/types'
import { GLBValidationError, CustomErrorWithTitle, OrphanedAuxiliaryFileError } from './errors'

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

describe('OrphanedAuxiliaryFileError', () => {
  describe('when constructed with one orphaned auxiliary file', () => {
    let error: OrphanedAuxiliaryFileError
    let orphans: ReadonlyArray<{ orphan: string; expected: string }>

    beforeEach(() => {
      orphans = [{ orphan: 'red_eyes_mask.png', expected: 'red_eyes.png' }]
      error = new OrphanedAuxiliaryFileError(orphans)
    })

    it('should be an instance of CustomErrorWithTitle', () => {
      expect(error).toBeInstanceOf(CustomErrorWithTitle)
    })

    it('should expose the offending orphans through the orphans property', () => {
      expect(error.orphans).toEqual(orphans)
    })

    it('should render a title element', () => {
      expect(error.title).toBeDefined()
    })

    it('should render a message containing one list item per orphan', () => {
      const message = error.message as ReactElement<{ children: ReactElement[] }>
      expect(message.props.children).toHaveLength(1)
    })
  })

  describe('when constructed with multiple orphaned auxiliary files', () => {
    let error: OrphanedAuxiliaryFileError
    let orphans: ReadonlyArray<{ orphan: string; expected: string }>

    beforeEach(() => {
      orphans = [
        { orphan: 'red_eyes_mask.png', expected: 'red_eyes.png' },
        { orphan: 'red_eyes_expressions_mask.png', expected: 'red_eyes_expressions.png' }
      ]
      error = new OrphanedAuxiliaryFileError(orphans)
    })

    it('should render a message containing one list item per orphan', () => {
      const message = error.message as ReactElement<{ children: ReactElement[] }>
      expect(message.props.children).toHaveLength(2)
    })

    it('should preserve the orphan ordering on the orphans property', () => {
      expect(error.orphans.map(entry => entry.orphan)).toEqual(['red_eyes_mask.png', 'red_eyes_expressions_mask.png'])
    })
  })

  describe('when constructed with an empty list', () => {
    let error: OrphanedAuxiliaryFileError

    beforeEach(() => {
      error = new OrphanedAuxiliaryFileError([])
    })

    it('should still render a title element', () => {
      expect(error.title).toBeDefined()
    })

    it('should render an empty list as the message body', () => {
      const message = error.message as ReactElement<{ children: ReactElement[] }>
      expect(message.props.children).toEqual([])
    })
  })
})
