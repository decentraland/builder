import { render, screen } from '@testing-library/react'
import WorldsStorage, { CURRENT_MBS_TEST_ID, PROGRESS_TEST_ID } from './WorldsStorage'

describe('when rendering the worlds storage component', () => {
  describe('when the provided current bytes is 50550000 and the max bytes is 100000000', () => {
    beforeEach(() => {
      render(<WorldsStorage currentBytes={50550000} maxBytes={100000000} />)
    })

    it('should render 50.55/100.00mb', () => {
      expect(screen.getByTestId(CURRENT_MBS_TEST_ID).textContent).toEqual('50.55 / 100.00 mb')
    })

    it('should render the storage front bar with 50%', () => {
      expect(screen.getByTestId(PROGRESS_TEST_ID).children[0].getAttribute('style')).toEqual('width: 50%;')
    })
  })
})
