import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'

export const LOCALSTORAGE_WORLDS_FOR_ENS_OWNERS_ANNOUNCEMENT = 'builder-worlds-for-ens-owners-announcement'

export const persistCanOpenWorldsForENSOwnersAnnouncementModal = (canOpen: boolean) => {
  const ls = getLocalStorage()
  ls.setItem(LOCALSTORAGE_WORLDS_FOR_ENS_OWNERS_ANNOUNCEMENT, canOpen ? undefined : '1')
}

export const canOpenWorldsForENSOwnersAnnouncementModal = () => {
  const ls = getLocalStorage()
  return ls.getItem(LOCALSTORAGE_WORLDS_FOR_ENS_OWNERS_ANNOUNCEMENT) !== '1'
}
