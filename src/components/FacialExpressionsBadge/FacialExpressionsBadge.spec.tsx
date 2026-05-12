import { render, screen } from '@testing-library/react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import FacialExpressionsBadge from './FacialExpressionsBadge'

describe('when rendering the FacialExpressionsBadge', () => {
  describe('and the contents include an _expressions.png file', () => {
    let contents: Record<string, string>

    beforeEach(() => {
      contents = {
        'red_eyes.png': 'hash1',
        'red_eyes_expressions.png': 'hash2'
      }
    })

    it('should render an element with the tooltip text as its accessible label', () => {
      render(<FacialExpressionsBadge contents={contents} />)
      expect(screen.getByLabelText(t('facial_expressions_badge.tooltip'))).toBeInTheDocument()
    })
  })

  describe('and the contents do not include any _expressions.png file', () => {
    let contents: Record<string, string>

    beforeEach(() => {
      contents = {
        'red_eyes.png': 'hash1',
        'red_eyes_mask.png': 'hash2'
      }
    })

    it('should render nothing', () => {
      const { container } = render(<FacialExpressionsBadge contents={contents} />)
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('and the contents are undefined', () => {
    it('should render nothing', () => {
      const { container } = render(<FacialExpressionsBadge contents={undefined} />)
      expect(container).toBeEmptyDOMElement()
    })
  })
})
