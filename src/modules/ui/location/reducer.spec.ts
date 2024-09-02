import { saveLastLocation } from './action'
import { locationReducer, LocationState } from './reducer'

let state: LocationState

describe('when reducing the save last location action', () => {
  beforeEach(() => {
    state = {
      lastLocation: undefined
    }
  })

  it('should set the last location', () => {
    expect(locationReducer(state, saveLastLocation('/some-location'))).toEqual({
      lastLocation: '/some-location'
    })
  })
})
