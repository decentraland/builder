import { render, screen } from '@testing-library/react'
import WorldsStorage, { CURRENT_MBS_TEST_ID, PROGRESS_TEST_ID, WORLDS_STORAGE_TEST_ID } from './WorldsStorage'

describe('when rendering the worlds storage component', () => {
  let currentBytes: number
  let maxBytes: number
  let className: string

  beforeEach(() => {
    currentBytes = 100
    maxBytes = 100
  })

  describe('when the provided current bytes is 50550000 and the max bytes is 100000000', () => {
    beforeEach(() => {
      currentBytes = 50550000
      maxBytes = 100000000

      render(<WorldsStorage currentBytes={currentBytes} maxBytes={maxBytes} />)
    })

    it('should render 50.55/100.00mb', () => {
      expect(screen.getByTestId(CURRENT_MBS_TEST_ID).textContent).toEqual('50.55 / 100.00 mb')
    })

    it('should render the storage front bar with 50%', () => {
      expect(screen.getByTestId(PROGRESS_TEST_ID).children[0].getAttribute('style')).toEqual('width: 50%;')
    })
  })

  describe('when providing a classname as prop', () => {
    beforeEach(() => {
      className = 'some-class'
      render(<WorldsStorage currentBytes={currentBytes} maxBytes={maxBytes} className={className} />)
    })
    it('should set the classname to the root element', () => {
      expect(screen.getByTestId(WORLDS_STORAGE_TEST_ID).className).toEqual(`worldsStorage ${className}`)
    })
  })

  describe('when a classname is not provided', () => {
    beforeEach(() => {
      render(<WorldsStorage currentBytes={currentBytes} maxBytes={maxBytes} />)
    })

    it('should set the classname to the root element', () => {
      expect(screen.getByTestId(WORLDS_STORAGE_TEST_ID).className).toEqual('worldsStorage')
    })
  })
})
