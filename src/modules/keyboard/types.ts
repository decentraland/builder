import type { ExtendedKeyboardEvent } from 'mousetrap'

export const WHITE_SPACE_KEY_CODE = 32
export const ENTER_KEY_CODE = 13
export const COMMA_KEY_CODE = 118
export const BACKSPACE_KEY_CODE = 8
export const DELETE_KEY_CODE = 46

export type KeyboardShortcut = BaseKeyboardShortcut & {
  callback: (event: ExtendedKeyboardEvent, combination: string) => any
}

export type BaseKeyboardShortcut = {
  combination: string | string[]
  action?: 'keydown' | 'keyup' | 'keypress'
}

export enum Shortcut {
  MOVE = 'MOVE',
  ROTATE = 'ROTATE',
  SCALE = 'SCALE',
  RESET_ITEM = 'RESET_ITEM',
  DUPLICATE_ITEM = 'DUPLICATE_ITEM',
  PREVIEW = 'PREVIEW',
  TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
  DELETE_ITEM = 'DELETE_ITEM',
  UNDO = 'UNDO',
  REDO = 'REDO',
  SHORTCUTS = 'SHORTCUTS',
  RESET_CAMERA = 'RESET_CAMERA',
  ZOOM_IN = 'ZOOM_IN',
  ZOOM_OUT = 'ZOOM_OUT',
  TOGGLE_SNAP_TO_GRID = 'TOGGLE_SNAP_TO_GRID',
  EXPORT_SCENE = 'EXPORT_SCENE',
  TOGGLE_MULTISELECTION = 'TOGGLE_MULTISELECTION'
}

export type LabeledShortcut = { title: string | null }
export type ShortcutAlternative = {
  type: 'alternative'
  value: [SimpleShortcut, SimpleShortcut] | [ShortcutCombination, ShortcutCombination]
} & LabeledShortcut
export type ShortcutCombination = { type: 'combination'; value: string[] } & LabeledShortcut
export type SimpleShortcut = { type: 'simple'; value: string; hold?: boolean } & LabeledShortcut
export type ShortcutLayout = Record<Shortcut, ShortcutDefinition>
export type ShortcutDefinition = SimpleShortcut | ShortcutAlternative | ShortcutCombination
