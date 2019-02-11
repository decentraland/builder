import { action } from 'typesafe-actions'
import { Scene } from 'modules/scene/types'
import { AssetMappings } from 'modules/asset/types'
import { Gizmo } from './types'

// Bind keyboard shortcuts

export const BIND_EDITOR_KEYBOARD_SHORTCUTS = 'Bind editor keyboard shortcuts'

export const bindEditorKeyboardShortcuts = () => action(BIND_EDITOR_KEYBOARD_SHORTCUTS, {})

export type BindEditorKeybardShortcutsAction = ReturnType<typeof bindEditorKeyboardShortcuts>

// Unbind keyboard shortcuts

export const UNBIND_KEYBOARD_SHORTCUTS = 'Unbind editor keyboard shortcuts'

export const unbindEditorKeyboardShortcuts = () => action(UNBIND_KEYBOARD_SHORTCUTS, {})

export type UnbindEditorKeybardShortcutsAction = ReturnType<typeof unbindEditorKeyboardShortcuts>

// Close editor

export const OPEN_EDITOR = 'Open editor'

export const openEditor = () => action(OPEN_EDITOR, {})

export type OpenEditorAction = ReturnType<typeof openEditor>

// Close editor

export const CLOSE_EDITOR = 'Close editor'

export const closeEditor = () => action(CLOSE_EDITOR, {})

export type CloseEditorAction = ReturnType<typeof closeEditor>

// Update editor

export const UPDATE_EDITOR = 'Update editor'

export const updateEditor = (sceneId: string, scene: Scene, mappings: AssetMappings) => action(UPDATE_EDITOR, { sceneId, scene, mappings })

export type UpdateEditorAction = ReturnType<typeof updateEditor>

// Undo/Redo

export const EDITOR_UNDO = 'Editor undo'
export const EDITOR_REDO = 'Editor redo'

export const editorUndo = () => action(EDITOR_UNDO, {})
export const editorRedo = () => action(EDITOR_REDO, {})

export type EditorUndoAction = ReturnType<typeof editorUndo>
export type EditorRedoAction = ReturnType<typeof editorRedo>

// Set Gizmo

export const SET_GIZMO = 'Set gizmo'

export const setGizmo = (gizmo: Gizmo) => action(SET_GIZMO, { gizmo })

export type SetGizmoAction = ReturnType<typeof setGizmo>

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

// Zoom in/out

export const ZOOM_IN = 'Zoom in'

export const zoomIn = () => action(ZOOM_IN, {})

export type ZoomInAction = ReturnType<typeof zoomIn>

export const ZOOM_OUT = 'Zoom out'

export const zoomOut = () => action(ZOOM_OUT, {})

export type ZoomOutAction = ReturnType<typeof zoomOut>

// Reset camera

export const RESET_CAMERA = 'Reset camera'

export const resetCamera = () => action(RESET_CAMERA, {})

export type ResetCameraAction = ReturnType<typeof resetCamera>

// Set editor ready

export const SET_EDITOR_READY = 'Set editor ready'

export const setEditorReady = () => action(SET_EDITOR_READY, {})

export type SetEditorReadyAction = ReturnType<typeof setEditorReady>

// Screenshot

export const TAKE_SCREENSHOT = 'Take screenshot'

export const takeScreenshot = () => action(TAKE_SCREENSHOT, {})

export type TakeScreenshotAction = ReturnType<typeof takeScreenshot>
