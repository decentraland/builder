import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { LocalStorage } from 'decentraland-dapps/dist/lib/types'
import {
  LOCALSTORAGE_WORLDS_FOR_ENS_OWNERS_ANNOUNCEMENT,
  canOpenWorldsForENSOwnersAnnouncementModal,
  persistCanOpenWorldsForENSOwnersAnnouncementModal
} from './utils'

jest.mock('decentraland-dapps/dist/lib/localStorage')

const mockGetLocalStorage = getLocalStorage as jest.MockedFunction<typeof getLocalStorage>

let setItem: jest.MockedFunction<LocalStorage['setItem']>
let ls: LocalStorage

beforeEach(() => {
  setItem = jest.fn()

  ls = {
    getItem: () => null,
    setItem
  } as unknown as LocalStorage

  mockGetLocalStorage.mockReturnValueOnce(ls)
})

describe('when getting if the worlds for ens owners announcement modal can be opened', () => {
  describe('when the local storage returns something else than "1"', () => {
    it('should return true', () => {
      expect(canOpenWorldsForENSOwnersAnnouncementModal()).toBeTruthy()
    })
  })

  describe('when the local storage returns "1"', () => {
    beforeEach(() => {
      ls.getItem = () => '1'
    })

    it('should return false', () => {
      expect(canOpenWorldsForENSOwnersAnnouncementModal()).toBeFalsy()
    })
  })
})

describe('when persisting if the worlds for ens owners announcement modal can be opened', () => {
  describe('when the value is true', () => {
    it('should call the set item local storage method with undefined', () => {
      persistCanOpenWorldsForENSOwnersAnnouncementModal(true)

      expect(setItem).toHaveBeenCalledWith(LOCALSTORAGE_WORLDS_FOR_ENS_OWNERS_ANNOUNCEMENT, undefined)
    })
  })

  describe('when the value is false', () => {
    it('should call the set item local storage method with "1"', () => {
      persistCanOpenWorldsForENSOwnersAnnouncementModal(false)

      expect(setItem).toHaveBeenCalledWith(LOCALSTORAGE_WORLDS_FOR_ENS_OWNERS_ANNOUNCEMENT, '1')
    })
  })
})
