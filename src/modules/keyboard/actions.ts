import { action } from 'typesafe-actions'
import { KeyboardShortcut, BaseKeyboardShortcut } from './types'

// Bind keyboard shortcuts

export const BIND_KEYBOARD_SHORTCUTS = 'Bind keyboard shortcuts'

export const bindKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => action(BIND_KEYBOARD_SHORTCUTS, { shortcuts })

export type BindKeybardShortcuts = ReturnType<typeof bindKeyboardShortcuts>

// Unbind keyboard shortcuts

export const UNBIND_KEYBOARD_SHORTCUTS = 'Unbind keyboard shortcuts'

export const unbindKeyboardShortcuts = (shortcuts: BaseKeyboardShortcut[]) => action(UNBIND_KEYBOARD_SHORTCUTS, { shortcuts })

export type UnbindKeybardShortcuts = ReturnType<typeof unbindKeyboardShortcuts>
