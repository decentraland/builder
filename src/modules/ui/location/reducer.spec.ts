import { locationChange } from 'modules/location/actions'
import { locationReducer, LocationState, INITIAL_STATE } from './reducer'

let state: LocationState

describe('when reducing the location change action', () => {
  describe('and there is no current location', () => {
    beforeEach(() => {
      state = INITIAL_STATE
    })

    it('should set the current location and leave last location undefined', () => {
      const newState = locationReducer(state, locationChange({ pathname: '/new-location', search: '', state: null, hash: '' }))
      expect(newState).toEqual({
        currentLocation: '/new-location',
        lastLocation: undefined
      })
    })
  })

  describe('and there is a current location', () => {
    beforeEach(() => {
      state = {
        currentLocation: '/current-location',
        lastLocation: undefined
      }
    })

    it('should move current location to last location and set new current location', () => {
      const newState = locationReducer(state, locationChange({ pathname: '/new-location', search: '', state: null, hash: '' }))
      expect(newState).toEqual({
        currentLocation: '/new-location',
        lastLocation: '/current-location'
      })
    })
  })

  describe('and there is already a last location', () => {
    beforeEach(() => {
      state = {
        currentLocation: '/current-location',
        lastLocation: '/old-location'
      }
    })

    it('should replace last location with current location and set new current location', () => {
      const newState = locationReducer(state, locationChange({ pathname: '/new-location', search: '', state: null, hash: '' }))
      expect(newState).toEqual({
        currentLocation: '/new-location',
        lastLocation: '/current-location'
      })
    })
  })
})
