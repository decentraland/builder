import { renderWithProviders } from 'specs/utils'
import { fireEvent } from '@testing-library/react'
import { ValidationSeverity } from 'lib/glbValidation/types'
import type { ValidationIssue } from 'lib/glbValidation/types'
import { ValidationIssuesPanel } from './ValidationIssuesPanel'

function makeIssue(code: string, severity: ValidationSeverity): ValidationIssue {
  return {
    code,
    severity,
    messageKey: `create_single_item_modal.error.glb_validation.${code.toLowerCase()}`,
    messageParams: {}
  }
}

describe('ValidationIssuesPanel', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when issues array is empty', () => {
    it('should render nothing', () => {
      const { container } = renderWithProviders(<ValidationIssuesPanel issues={[]} />)
      expect(container.querySelector('.ValidationIssuesPanel')).toBeNull()
    })
  })

  describe('when there are only error-severity issues', () => {
    let container: HTMLElement

    beforeEach(() => {
      const issues: ValidationIssue[] = [
        makeIssue('TRIANGLE_COUNT_EXCEEDED', ValidationSeverity.ERROR),
        makeIssue('MATERIALS_EXCEEDED', ValidationSeverity.ERROR)
      ]
      const result = renderWithProviders(<ValidationIssuesPanel issues={issues} />)
      container = result.container
    })

    it('should render the panel with has-errors class', () => {
      expect(container.querySelector('.ValidationIssuesPanel.has-errors')).not.toBeNull()
    })

    it('should render all issues in the list', () => {
      const items = container.querySelectorAll('.ValidationIssuesPanel-issue')
      expect(items).toHaveLength(2)
    })

    it('should render error icons for each issue', () => {
      const icons = container.querySelectorAll('.ValidationIssuesPanel-issue.error .ValidationIssuesPanel-icon')
      expect(icons).toHaveLength(2)
      icons.forEach(icon => {
        expect(icon.textContent).toBe('\u2716')
      })
    })
  })

  describe('when there are only warning-severity issues', () => {
    let container: HTMLElement

    beforeEach(() => {
      const issues: ValidationIssue[] = [makeIssue('LEAF_BONES_FOUND', ValidationSeverity.WARNING)]
      const result = renderWithProviders(<ValidationIssuesPanel issues={issues} />)
      container = result.container
    })

    it('should render the panel with warnings-only class', () => {
      expect(container.querySelector('.ValidationIssuesPanel.warnings-only')).not.toBeNull()
    })

    it('should render warning icons', () => {
      const icon = container.querySelector('.ValidationIssuesPanel-issue.warning .ValidationIssuesPanel-icon')
      expect(icon?.textContent).toBe('\u26A0')
    })
  })

  describe('when there are both errors and warnings', () => {
    let container: HTMLElement

    beforeEach(() => {
      const issues: ValidationIssue[] = [
        makeIssue('LEAF_BONES_FOUND', ValidationSeverity.WARNING),
        makeIssue('TRIANGLE_COUNT_EXCEEDED', ValidationSeverity.ERROR)
      ]
      const result = renderWithProviders(<ValidationIssuesPanel issues={issues} />)
      container = result.container
    })

    it('should render errors before warnings', () => {
      const items = container.querySelectorAll('.ValidationIssuesPanel-issue')
      expect(items[0].classList.contains('error')).toBe(true)
      expect(items[1].classList.contains('warning')).toBe(true)
    })

    it('should use has-errors class on the panel', () => {
      expect(container.querySelector('.ValidationIssuesPanel.has-errors')).not.toBeNull()
    })
  })

  describe('when the header is clicked', () => {
    let container: HTMLElement

    beforeEach(() => {
      const issues: ValidationIssue[] = [makeIssue('CAMERAS_FOUND', ValidationSeverity.ERROR)]
      const result = renderWithProviders(<ValidationIssuesPanel issues={issues} />)
      container = result.container
    })

    it('should collapse the list', () => {
      const header = container.querySelector('.ValidationIssuesPanel-header')!
      expect(container.querySelector('.ValidationIssuesPanel-list')).not.toBeNull()

      fireEvent.click(header)
      expect(container.querySelector('.ValidationIssuesPanel-list')).toBeNull()
    })

    describe('and clicked again', () => {
      it('should expand the list back', () => {
        const header = container.querySelector('.ValidationIssuesPanel-header')!
        fireEvent.click(header)
        fireEvent.click(header)
        expect(container.querySelector('.ValidationIssuesPanel-list')).not.toBeNull()
      })
    })
  })
})
