import { action } from 'typesafe-actions'

import { Scene } from 'modules/scene/types'
import { Asset } from 'modules/asset/types'
import { Project } from 'modules/project/types'
import { Gizmo } from './types'

// Bind keyboard shortcuts

export const BIND_EDITOR_KEYBOARD_SHORTCUTS = 'Bind editor keyboard shortcuts'

export const bindEditorKeyboardShortcuts = () => action(BIND_EDITOR_KEYBOARD_SHORTCUTS, {})

export type BindEditorKeybardShortcutsAction = ReturnType<typeof bindEditorKeyboardShortcuts>

// Unbind keyboard shortcuts

export const UNBIND_EDITOR_KEYBOARD_SHORTCUTS = 'Unbind editor keyboard shortcuts'

export const unbindEditorKeyboardShortcuts = () => action(UNBIND_EDITOR_KEYBOARD_SHORTCUTS, {})

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

export const updateEditor = (sceneId: string, scene: Scene, mappings: Record<string, string>) =>
  action(UPDATE_EDITOR, { sceneId, scene, mappings })

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

export const togglePreview = (isEnabled: boolean) => action(TOGGLE_PREVIEW, { isEnabled })

export type TogglePreviewAction = ReturnType<typeof togglePreview>

// Toggle Sidebar

export const TOGGLE_SIDEBAR = 'Toggle sidebar'

export const toggleSidebar = (isEnabled: boolean) => action(TOGGLE_SIDEBAR, { isEnabled })

export type ToggleSidebarAction = ReturnType<typeof toggleSidebar>

// Select Entity

export const SELECT_ENTITY = 'Select entity'

export const selectEntity = (entityId: string) => action(SELECT_ENTITY, { entityId })

export type SelectEntityAction = ReturnType<typeof selectEntity>

// Deselect Entity

export const DESELECT_ENTITY = 'Deselect entity'

export const deselectEntity = () => action(DESELECT_ENTITY, {})

export type DeselectEntityAction = ReturnType<typeof deselectEntity>

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

export const setEditorReady = (isReady: boolean) => action(SET_EDITOR_READY, { isReady })

export type SetEditorReadyAction = ReturnType<typeof setEditorReady>

// Screenshot

export const TAKE_SCREENSHOT = 'Take screenshot'

export const takeScreenshot = () => action(TAKE_SCREENSHOT, {})

export type TakeScreenshotAction = ReturnType<typeof takeScreenshot>

// Toggle snap to grid

export const TOGGLE_SNAP_TO_GRID = 'Toggle snap to grid'

export const toggleSnapToGrid = (enabled: boolean) => action(TOGGLE_SNAP_TO_GRID, { enabled })

export type ToggleSnapToGridAction = ReturnType<typeof toggleSnapToGrid>

// Create update the editor scene from a project

export const NEW_EDITOR_SCENE = 'New editor scene'

export const newEditorScene = (id: string, project: Partial<Project>) => action(NEW_EDITOR_SCENE, { id, project })

export type NewEditorSceneAction = ReturnType<typeof newEditorScene>

// Close editor

export const PREFETCH_ASSET = 'Prefetch Asset'

export const prefetchAsset = (asset: Asset) => action(PREFETCH_ASSET, { asset })

export type PrefetchAssetAction = ReturnType<typeof prefetchAsset>

// Set entities out of bounds

export const SET_ENTITIES_OUT_OF_BOUNDARIES = 'Set entities out of boundaries'

export const setEntitiesOutOfBoundaries = (entities: string[]) => action(SET_ENTITIES_OUT_OF_BOUNDARIES, { entities })

export type SetEntitiesOutOfBoundariesAction = ReturnType<typeof setEntitiesOutOfBoundaries>
