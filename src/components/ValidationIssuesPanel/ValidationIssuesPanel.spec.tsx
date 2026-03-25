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
      expect(container.querySelector('.panel')).toBeNull()
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

    it('should render the panel with hasErrors class', () => {
      expect(container.querySelector('.panel.hasErrors')).not.toBeNull()
    })

    it('should render all issues in the list', () => {
      const items = container.querySelectorAll('.issue')
      expect(items).toHaveLength(2)
    })

    it('should render error icons for each issue', () => {
      const icons = container.querySelectorAll('.issue.issueError .icon')
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

    it('should render the panel with warningsOnly class', () => {
      expect(container.querySelector('.panel.warningsOnly')).not.toBeNull()
    })

    it('should render warning icons', () => {
      const icon = container.querySelector('.issue.issueWarning .icon')
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
      const items = container.querySelectorAll('.issue')
      expect(items[0].classList.contains('issueError')).toBe(true)
      expect(items[1].classList.contains('issueWarning')).toBe(true)
    })

    it('should use hasErrors class on the panel', () => {
      expect(container.querySelector('.panel.hasErrors')).not.toBeNull()
    })
  })

  describe('when collapsible is true (default)', () => {
    describe('and the header is clicked', () => {
      let container: HTMLElement

      beforeEach(() => {
        const issues: ValidationIssue[] = [makeIssue('CAMERAS_FOUND', ValidationSeverity.WARNING)]
        const result = renderWithProviders(<ValidationIssuesPanel issues={issues} />)
        container = result.container
      })

      it('should collapse the list', () => {
        const header = container.querySelector('.header')!
        expect(container.querySelector('.list')).not.toBeNull()

        fireEvent.click(header)
        expect(container.querySelector('.list')).toBeNull()
      })

      describe('and clicked again', () => {
        it('should expand the list back', () => {
          const header = container.querySelector('.header')!
          fireEvent.click(header)
          fireEvent.click(header)
          expect(container.querySelector('.list')).not.toBeNull()
        })
      })
    })
  })

  describe('when collapsible is false', () => {
    let container: HTMLElement

    beforeEach(() => {
      const issues: ValidationIssue[] = [makeIssue('CAMERAS_FOUND', ValidationSeverity.WARNING)]
      const result = renderWithProviders(<ValidationIssuesPanel issues={issues} collapsible={false} />)
      container = result.container
    })

    it('should not render the toggle arrow', () => {
      expect(container.querySelector('.toggle')).toBeNull()
    })

    it('should always show the list', () => {
      expect(container.querySelector('.list')).not.toBeNull()
    })

    it('should not collapse when header is clicked', () => {
      const header = container.querySelector('.header')!
      fireEvent.click(header)
      expect(container.querySelector('.list')).not.toBeNull()
    })
  })
})
