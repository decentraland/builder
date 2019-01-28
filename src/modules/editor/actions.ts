import { action } from 'typesafe-actions'
import { EditorScene } from './types'

// Bind keyboard shortcuts

export const BIND_EDITOR_KEYBOARD_SHORTCUTS = 'Bind editor keyboard shortcuts'

export const bindEditorKeyboardShortcuts = () => action(BIND_EDITOR_KEYBOARD_SHORTCUTS, {})

export type BindEditorKeybardShortcutsAction = ReturnType<typeof bindEditorKeyboardShortcuts>

// Unbind keyboard shortcuts

export const UNBIND_KEYBOARD_SHORTCUTS = 'Unbind editor keyboard shortcuts'

export const unbindEditorKeyboardShortcuts = () => action(UNBIND_KEYBOARD_SHORTCUTS, {})

export type UnbindEditorKeybardShortcutsAction = ReturnType<typeof unbindEditorKeyboardShortcuts>

// Start editor

export const START_EDITOR = 'Start editor'

export const startEditor = () => action(START_EDITOR, {})

export type StartEditorAction = ReturnType<typeof startEditor>

// Close editor

export const CLOSE_EDITOR = 'Close editor'

export const closeEditor = () => action(CLOSE_EDITOR, {})

export type CloseEditorAction = ReturnType<typeof closeEditor>

// Update editor

export const UPDATE_EDITOR = 'Update editor'

export const updateEditor = (sceneId: string, scene: EditorScene) => action(UPDATE_EDITOR, { sceneId, scene })

export type UpdateEditorAction = ReturnType<typeof updateEditor>

// Undo/Redo

export const EDITOR_UNDO = 'Editor undo'
export const EDITOR_REDO = 'Editor redo'

export const editorUndo = () => action(EDITOR_UNDO, {})
export const editorRedo = () => action(EDITOR_REDO, {})

export type EditorUndoAction = ReturnType<typeof editorUndo>
export type EditorRedoAction = ReturnType<typeof editorRedo>
