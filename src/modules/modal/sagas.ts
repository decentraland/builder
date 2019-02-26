import { history, store } from 'modules/common/store'
import { closeAllModals } from './actions'

export function modalSaga() {
  history.listen(() => store.dispatch(closeAllModals()))
}
