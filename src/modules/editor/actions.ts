import { action } from 'typesafe-actions'

// Bind keyboard shortcuts

export const BIND_EDITOR_KEYBOARD_SHORTCUTS = 'Bind editor keyboard shortcuts'

export const bindEditorKeyboardShortcuts = () => action(BIND_EDITOR_KEYBOARD_SHORTCUTS, {})

export type BindEditorKeybardShortcuts = ReturnType<typeof bindEditorKeyboardShortcuts>

// Unbind keyboard shortcuts

export const UNBIND_KEYBOARD_SHORTCUTS = 'Unbind editor keyboard shortcuts'

export const unbindEditorKeyboardShortcuts = () => action(UNBIND_KEYBOARD_SHORTCUTS, {})

export type UnbindEditorKeybardShortcuts = ReturnType<typeof unbindEditorKeyboardShortcuts>
