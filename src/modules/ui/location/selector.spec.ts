import { RootState } from 'modules/common/types'
import { getLastLocation } from './selector'

let state: RootState

beforeEach(() => {
  state = {
    ui: {
      location: {
        lastLocation: undefined
      }
    }
  } as RootState
})

describe('when getting the last location', () => {
  describe('and the last location is not set', () => {
    beforeEach(() => {
      state.ui.location.lastLocation = undefined
    })

    it('should return undefined', () => {
      expect(getLastLocation(state)).toBeUndefined()
    })
  })

  describe('and the last location is set', () => {
    beforeEach(() => {
      state.ui.location.lastLocation = '/some-location'
    })

    it('should return the last location', () => {
      expect(getLastLocation(state)).toEqual('/some-location')
    })
  })
})
