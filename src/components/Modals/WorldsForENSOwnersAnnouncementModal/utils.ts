import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'

export const LOCALSTORAGE_WORLDS_FOR_ENS_OWNERS_ANNOUCEMENT = 'builder-worlds-for-ens-owners-announcement'

export const persistCanOpenWorldsForENSOwnersAnnouncementModal = (canOpen: boolean) => {
  const ls = getLocalStorage()
  ls.setItem(LOCALSTORAGE_WORLDS_FOR_ENS_OWNERS_ANNOUCEMENT, canOpen ? undefined : '1')
}

export const canOpenWorldsForENSOwnersAnnouncementModal = () => {
  const ls = getLocalStorage()
  return ls.getItem(LOCALSTORAGE_WORLDS_FOR_ENS_OWNERS_ANNOUCEMENT) !== '1'
}
