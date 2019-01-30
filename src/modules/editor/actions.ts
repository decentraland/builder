import { action } from 'typesafe-actions'
import { SceneDefinition } from 'modules/scene/types'
import { AssetMappings } from 'modules/asset/types'
import { EditorMode } from './types'

// Bind keyboard shortcuts

export const BIND_EDITOR_KEYBOARD_SHORTCUTS = 'Bind editor keyboard shortcuts'

export const bindEditorKeyboardShortcuts = () => action(BIND_EDITOR_KEYBOARD_SHORTCUTS, {})

export type BindEditorKeybardShortcutsAction = ReturnType<typeof bindEditorKeyboardShortcuts>

// Unbind keyboard shortcuts

export const UNBIND_KEYBOARD_SHORTCUTS = 'Unbind editor keyboard shortcuts'

export const unbindEditorKeyboardShortcuts = () => action(UNBIND_KEYBOARD_SHORTCUTS, {})

export type UnbindEditorKeybardShortcutsAction = ReturnType<typeof unbindEditorKeyboardShortcuts>

// Close editor

export const CLOSE_EDITOR = 'Close editor'

export const closeEditor = () => action(CLOSE_EDITOR, {})

export type CloseEditorAction = ReturnType<typeof closeEditor>

// Update editor

export const UPDATE_EDITOR = 'Update editor'

export const updateEditor = (sceneId: string, scene: SceneDefinition, mappings: AssetMappings) =>
  action(UPDATE_EDITOR, { sceneId, scene, mappings })

export type UpdateEditorAction = ReturnType<typeof updateEditor>

// Undo/Redo

export const EDITOR_UNDO = 'Editor undo'
export const EDITOR_REDO = 'Editor redo'

export const editorUndo = () => action(EDITOR_UNDO, {})
export const editorRedo = () => action(EDITOR_REDO, {})

export type EditorUndoAction = ReturnType<typeof editorUndo>
export type EditorRedoAction = ReturnType<typeof editorRedo>

// Set Mode

export const SET_MODE = 'Set mode'

export const setMode = (mode: EditorMode) => action(SET_MODE, { mode })

export type SetModeAction = ReturnType<typeof setMode>

// Toggle Play

export const TOGGLE_PREVIEW = 'Toggle preview'

export const togglePreview = (enabled: boolean) => action(TOGGLE_PREVIEW, { enabled })

export type TogglePreviewAction = ReturnType<typeof togglePreview>

// Toggle Sidebar

export const TOGGLE_SIDEBAR = 'Toggle sidebar'

export const toggleSidebar = (enabled: boolean) => action(TOGGLE_SIDEBAR, { enabled })

export type ToggleSidebarAction = ReturnType<typeof toggleSidebar>

// Select Entity

export const SELECT_ENTITY = 'Select entity'

export const selectEntity = (entityId: string) => action(SELECT_ENTITY, { entityId })

export type SelectEntityAction = ReturnType<typeof selectEntity>

// Unselect Entity

export const UNSELECT_ENTITY = 'Unselect entity'

export const unselectEntity = () => action(UNSELECT_ENTITY, {})

export type UnselectEntityAction = ReturnType<typeof unselectEntity>
