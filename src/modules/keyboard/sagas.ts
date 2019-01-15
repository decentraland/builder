import { takeLatest } from 'redux-saga/effects'
import Mousetrap from 'mousetrap'
import { BIND_KEYBOARD_SHORTCUTS, BindKeybardShortcuts, UNBIND_KEYBOARD_SHORTCUTS, UnbindKeybardShortcuts } from 'modules/keyboard/actions'

export function* keyboardSaga() {
  yield takeLatest(BIND_KEYBOARD_SHORTCUTS, handleBindKeyboardShortcuts)
  yield takeLatest(UNBIND_KEYBOARD_SHORTCUTS, handleUnbindKeyboardShortcuts)
}

function handleBindKeyboardShortcuts(action: BindKeybardShortcuts) {
  for (const shortcut of action.payload.shortcuts) {
    const { combination, callback, action } = shortcut
    Mousetrap.bind(combination, callback, action)
  }
}

function handleUnbindKeyboardShortcuts(action: UnbindKeybardShortcuts) {
  for (const shortcut of action.payload.shortcuts) {
    const { combination, action } = shortcut
    Mousetrap.unbind(combination, action)
  }
}
