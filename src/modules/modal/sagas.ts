import { getOpenModals } from 'decentraland-dapps/dist/modules/modal/selectors'

import { history, store } from 'modules/common/store'
import { closeAllModals } from './actions'

export function modalSaga() {
  // Can't use generators inside the history listen callback
  history.listen(() => handleURLChange())
}

function handleURLChange() {
  const openModals = getOpenModals(store.getState())

  if (Object.keys(openModals).length > 0) {
    // Move the dispatch to the end of the queue to avoid conflicting with other running sagas
    setTimeout(() => store.dispatch(closeAllModals()))
  }
}
