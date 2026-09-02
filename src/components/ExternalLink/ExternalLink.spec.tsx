import { render, screen } from '@testing-library/react'
import ExternalLink from './ExternalLink'

describe('when rendering an external link', () => {
  let url: string

  describe('and the url is a valid https url', () => {
    beforeEach(() => {
      url = 'https://forum.decentraland.org/t/a-post/1'
      render(<ExternalLink href={url}>a link</ExternalLink>)
    })

    it('should point the link to the url', () => {
      expect(screen.getByRole('link', { name: 'a link' })).toHaveAttribute('href', url)
    })

    it('should open it in a new tab without sharing the current context', () => {
      const link = screen.getByRole('link', { name: 'a link' })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('and the url is not an https url', () => {
    beforeEach(() => {
      url = 'javascript:void 0'
      render(<ExternalLink href={url}>a link</ExternalLink>)
    })

    it('should render the link without a destination', () => {
      expect(screen.getByText('a link').closest('a')).not.toHaveAttribute('href')
    })

    it('should still open in a new tab without sharing the current context', () => {
      const anchor = screen.getByText('a link').closest('a')
      expect(anchor).toHaveAttribute('target', '_blank')
      expect(anchor).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
