import { Store } from 'redux'
import { setGizmo, togglePreview, toggleSidebar, editorUndo, editorRedo, resetCamera, zoomIn, zoomOut } from 'modules/editor/actions'
import { resetItem, duplicateItem, deleteItem } from 'modules/scene/actions'
import { isPreviewing, isSidebarOpen } from 'modules/editor/selectors'
import { openModal } from 'modules/modal/actions'
import { Gizmo } from 'modules/editor/types'
import { ShortcutDefinition, Shortcut, ShortcutLayout } from './types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

const COMMAND_KEY = 'command'
const CONTROL_KEY = 'ctrl'

export const SpecialKeys = {
  OSCTRL: isMac() ? COMMAND_KEY : CONTROL_KEY,
  SHIFT: 'shift',
  SPACE: 'space',
  DELETE: 'del',
  BACKSPACE: 'backspace'
}

export const getQwertyLayout = (): ShortcutLayout => ({
  [Shortcut.MOVE]: { type: 'simple', value: 'w', title: t('shortcuts.move') },
  [Shortcut.ROTATE]: { type: 'simple', value: 'e', title: t('shortcuts.rotate') },
  [Shortcut.RESET_ITEM]: { type: 'simple', value: 's', title: t('shortcuts.reset') },
  [Shortcut.DUPLICATE_ITEM]: { type: 'simple', value: 'd', title: t('shortcuts.duplicate') },
  [Shortcut.PREVIEW]: { type: 'simple', value: 'o', title: t('shortcuts.play_mode') },
  [Shortcut.TOGGLE_SIDEBAR]: { type: 'simple', value: 'p', title: t('shortcuts.toggle_sidebar') },
  [Shortcut.DELETE_ITEM]: {
    type: 'alternative',
    value: [{ type: 'simple', value: SpecialKeys.DELETE, title: null }, { type: 'simple', value: SpecialKeys.BACKSPACE, title: null }],
    title: t('shortcuts.delete')
  },
  [Shortcut.UNDO]: { type: 'combination', value: [SpecialKeys.OSCTRL, 'z'], title: t('shortcuts.undo') },
  [Shortcut.REDO]: { type: 'combination', value: [SpecialKeys.OSCTRL, SpecialKeys.SHIFT, 'z'], title: t('shortcuts.redo') },
  [Shortcut.SHORTCUTS]: { type: 'simple', value: '?', title: t('shortcuts.shortcut_reference') },
  [Shortcut.RESET_CAMERA]: { type: 'simple', value: SpecialKeys.SPACE, title: t('shortcuts.reset_camera') },
  [Shortcut.ZOOM_IN]: {
    type: 'alternative',
    value: [{ type: 'simple', value: '+', title: null }, { type: 'simple', value: '=', title: null }],
    title: t('shortcuts.zoom_in')
  },
  [Shortcut.ZOOM_OUT]: {
    type: 'alternative',
    value: [{ type: 'simple', value: '-', title: null }, { type: 'simple', value: '_', title: null }],
    title: t('shortcuts.zoom_out')
  }
})

export function isMac(): boolean {
  if (navigator.platform === 'MacIntel') return true
  return false
}

export function mapLabel(label: string): string {
  if (label === 'command') {
    return '⌘'
  }

  return label
}

export function getLibraryComplatibleShortcut(shortcut: ShortcutDefinition): string[] {
  if (shortcut.type === 'alternative') {
    return [getLibraryComplatibleShortcut(shortcut.value[0])[0], getLibraryComplatibleShortcut(shortcut.value[1])[0]]
  }

  if (shortcut.type === 'combination') {
    return [shortcut.value.join('+')]
  }

  // It's of type 'simple'
  return [shortcut.value]
}

export function getEditorShortcuts(store: Store) {
  const qwertyLayout = getQwertyLayout()
  return [
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.MOVE]),
      callback: () => store.dispatch(setGizmo(Gizmo.MOVE))
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.ROTATE]),
      callback: () => store.dispatch(setGizmo(Gizmo.ROTATE))
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.RESET_ITEM]),
      callback: () => store.dispatch(resetItem())
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.DUPLICATE_ITEM]),
      callback: () => store.dispatch(duplicateItem())
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.PREVIEW]),
      callback: () => store.dispatch(togglePreview(!isPreviewing(store.getState())))
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.TOGGLE_SIDEBAR]),
      callback: () => store.dispatch(toggleSidebar(!isSidebarOpen(store.getState())))
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.DELETE_ITEM]),
      callback: () => store.dispatch(deleteItem())
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.UNDO]),
      callback: () => store.dispatch(editorUndo())
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.REDO]),
      callback: () => store.dispatch(editorRedo())
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.SHORTCUTS]),
      callback: () => store.dispatch(openModal('ShortcutsModal'))
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.RESET_CAMERA]),
      callback: () => store.dispatch(resetCamera())
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.ZOOM_IN]),
      callback: () => store.dispatch(zoomIn())
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.ZOOM_OUT]),
      callback: () => store.dispatch(zoomOut())
    }
  ]
}
