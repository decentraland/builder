import { render, screen } from '@testing-library/react'
import WorldsStorage, { BAR_FRONT_TEST_ID, CURRENT_MBS_TEST_ID } from './WorldsStorage'

describe('when rendering the worlds storage component', () => {
  describe('when the provided current bytes is 75000000 and the max bytes is 100000000', () => {
    beforeEach(() => {
      render(<WorldsStorage currentBytes="75000000" maxBytes="100000000" />)
    })

    it('should render 75/100mb', () => {
      expect(screen.getByTestId(CURRENT_MBS_TEST_ID).textContent).toEqual('75 / 100 mb')
    })

    it('should render the storage front bar with 75%', () => {
      expect(screen.getByTestId(BAR_FRONT_TEST_ID).style.width).toEqual('75%')
    })
  })
})
