import { render, screen } from '@testing-library/react'
import WorldsStorage, { CURRENT_MBS_TEST_ID, PROGRESS_TEST_ID, WORLDS_STORAGE_TEST_ID } from './WorldsStorage'
import { Props } from './WorldsStorage.types'

const renderWorldsStorage = (props: Partial<Props>) => {
  render(<WorldsStorage currentBytes={0} maxBytes={0} onViewDetails={jest.fn()} {...props} />)
}

describe('when rendering the worlds storage component', () => {
  describe('when the provided current bytes is 69898076 (66.66 Mb) and the max bytes is 104857600 (100 Mb)', () => {
    beforeEach(() => {
      renderWorldsStorage({
        currentBytes: 69898076,
        maxBytes: 104857600
      })
    })

    it('should render 66.66 / 100 Mb', () => {
      expect(screen.getByTestId(CURRENT_MBS_TEST_ID).textContent).toEqual('66.66 / 100 Mb')
    })

    it('should render the storage front bar with 50%', () => {
      expect(screen.getByTestId(PROGRESS_TEST_ID).children[0].getAttribute('style')).toEqual('width: 66%;')
    })
  })

  describe('when providing a classname as prop', () => {
    let className: string

    beforeEach(() => {
      className = 'some-class'

      renderWorldsStorage({
        className
      })
    })

    it('should set the classname to the root element', () => {
      expect(screen.getByTestId(WORLDS_STORAGE_TEST_ID).className).toEqual(`container ${className}`)
    })
  })

  describe('when a classname is not provided', () => {
    beforeEach(() => {
      renderWorldsStorage({})
    })

    it('should set the classname to the root element', () => {
      expect(screen.getByTestId(WORLDS_STORAGE_TEST_ID).className).toEqual('container')
    })
  })

  describe('when clicking on the view details link', () => {
    let onViewDetails: jest.Mock

    beforeEach(() => {
      onViewDetails = jest.fn()

      renderWorldsStorage({
        onViewDetails
      })
    })

    it('should call the on view details prop', () => {
      screen.getByText('View Details').click()
      expect(onViewDetails).toHaveBeenCalled()
    })
  })
})
