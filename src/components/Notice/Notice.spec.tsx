import { RenderResult, act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { renderWithProviders } from 'specs/utils'
import Notice from './Notice'

const STORAGE_KEY = 'a-notice-key'

let renderResult: RenderResult

afterEach(() => {
  localStorage.clear()
  jest.restoreAllMocks()
})

describe('when rendering the notice', () => {
  describe('and it was not closed before', () => {
    beforeEach(() => {
      renderWithProviders(<Notice storageKey={STORAGE_KEY}>A notice</Notice>)
    })

    it('should render its content', () => {
      expect(screen.getByText('A notice')).toBeInTheDocument()
    })
  })

  describe('and it was closed before', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEY, '1')
      renderResult = renderWithProviders(<Notice storageKey={STORAGE_KEY}>A notice</Notice>)
    })

    it('should render nothing', () => {
      expect(renderResult.container).toBeEmptyDOMElement()
    })
  })

  describe('and the close button is clicked', () => {
    beforeEach(() => {
      renderResult = renderWithProviders(<Notice storageKey={STORAGE_KEY}>A notice</Notice>)
      act(() => userEvent.click(screen.getByRole('button', { name: t('global.close') })))
    })

    it('should hide the notice', () => {
      expect(renderResult.container).toBeEmptyDOMElement()
    })

    it('should remember it was closed', () => {
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    })
  })

  describe('and the storage is unavailable', () => {
    beforeEach(() => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable')
      })
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage unavailable')
      })
    })

    describe('and it is rendered', () => {
      beforeEach(() => {
        renderWithProviders(<Notice storageKey={STORAGE_KEY}>A notice</Notice>)
      })

      it('should render its content', () => {
        expect(screen.getByText('A notice')).toBeInTheDocument()
      })
    })

    describe('and the close button is clicked', () => {
      beforeEach(() => {
        renderResult = renderWithProviders(<Notice storageKey={STORAGE_KEY}>A notice</Notice>)
        act(() => userEvent.click(screen.getByRole('button', { name: t('global.close') })))
      })

      it('should hide the notice', () => {
        expect(renderResult.container).toBeEmptyDOMElement()
      })
    })
  })
})
