import { Store } from 'redux'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import {
  setGizmo,
  togglePreview,
  toggleSidebar,
  editorUndo,
  editorRedo,
  resetCamera,
  zoomIn,
  zoomOut,
  toggleSnapToGrid,
  toggleMultiselection
} from 'modules/editor/actions'
import { resetItem, duplicateItem, deleteItem } from 'modules/scene/actions'
import { isPreviewing, isSidebarOpen, getGizmo } from 'modules/editor/selectors'
import { getCurrentProject } from 'modules/project/selectors'
import { toggleModal, openModal } from 'modules/modal/actions'
import {
  ShortcutDefinition,
  Shortcut,
  ShortcutLayout,
  ShortcutCombination,
  SimpleShortcut,
  ShortcutAlternative,
  KeyboardShortcut
} from './types'
import { Gizmo } from 'modules/editor/types'

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
  [Shortcut.SCALE]: { type: 'simple', value: 'r', title: t('shortcuts.scale') },
  [Shortcut.RESET_ITEM]: { type: 'simple', value: 's', title: t('shortcuts.reset') },
  [Shortcut.DUPLICATE_ITEM]: { type: 'simple', value: 'd', title: t('shortcuts.duplicate') },
  [Shortcut.PREVIEW]: { type: 'simple', value: 'i', title: t('shortcuts.preview') },
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
  },
  [Shortcut.TOGGLE_SNAP_TO_GRID]: {
    type: 'simple',
    value: 'shift',
    title: t('shortcuts.precision'),
    hold: true
  },
  [Shortcut.EXPORT_SCENE]: {
    type: 'simple',
    value: 'o',
    title: t('shortcuts.export')
  },
  [Shortcut.TOGGLE_MULTISELECTION]: {
    type: 'simple',
    value: 'ctrl',
    title: t('shortcuts.multiselect'),
    hold: true
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

export function getEditorShortcuts(store: Store): KeyboardShortcut[] {
  const qwertyLayout = getQwertyLayout()
  return [
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.MOVE]),
      callback: () => store.dispatch(setGizmo(getGizmo(store.getState()) === Gizmo.MOVE ? Gizmo.NONE : Gizmo.MOVE)),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.ROTATE]),
      callback: () => store.dispatch(setGizmo(getGizmo(store.getState()) === Gizmo.ROTATE ? Gizmo.NONE : Gizmo.ROTATE)),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.SCALE]),
      callback: () => store.dispatch(setGizmo(getGizmo(store.getState()) === Gizmo.SCALE ? Gizmo.NONE : Gizmo.SCALE)),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.RESET_ITEM]),
      callback: () => store.dispatch(resetItem()),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.DUPLICATE_ITEM]),
      callback: () => store.dispatch(duplicateItem()),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.PREVIEW]),
      callback: () => store.dispatch(togglePreview(!isPreviewing(store.getState()))),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.TOGGLE_SIDEBAR]),
      callback: () => store.dispatch(toggleSidebar(!isSidebarOpen(store.getState()))),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.DELETE_ITEM]),
      callback: () => store.dispatch(deleteItem()),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.UNDO]),
      callback: () => store.dispatch(editorUndo()),
      action: 'keydown'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.REDO]),
      callback: () => store.dispatch(editorRedo()),
      action: 'keydown'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.SHORTCUTS]),
      callback: () => store.dispatch(toggleModal('ShortcutsModal')),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.RESET_CAMERA]),
      callback: () => store.dispatch(resetCamera()),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.ZOOM_IN]),
      callback: () => store.dispatch(zoomIn()),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.ZOOM_OUT]),
      callback: () => store.dispatch(zoomOut()),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.TOGGLE_SNAP_TO_GRID]),
      callback: () => store.dispatch(toggleSnapToGrid(false)),
      action: 'keydown'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.TOGGLE_SNAP_TO_GRID]),
      callback: () => store.dispatch(toggleSnapToGrid(true)),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.EXPORT_SCENE]),
      callback: () => store.dispatch(openModal('ExportModal', { project: getCurrentProject(store.getState()) })),
      action: 'keyup'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.TOGGLE_MULTISELECTION]),
      callback: () => store.dispatch(toggleMultiselection(true)),
      action: 'keydown'
    },
    {
      combination: getLibraryComplatibleShortcut(qwertyLayout[Shortcut.TOGGLE_MULTISELECTION]),
      callback: () => store.dispatch(toggleMultiselection(false)),
      action: 'keyup'
    }
  ]
}

export abstract class ShortcutRenderer {
  renderCombination(shortcut: ShortcutCombination) {
    let out: (JSX.Element | string)[] = []

    for (let i = 0; i < shortcut.value.length; i++) {
      const simple: SimpleShortcut = { type: 'simple', value: shortcut.value[i], title: shortcut.title }
      out.push(this.renderShortcut(simple))

      if (i !== shortcut.value.length - 1) {
        out.push(this.renderPlus(i))
      }
    }

    return out
  }

  renderAlternative = (shortcut: ShortcutAlternative, onlyFirst?: boolean) => {
    const alternatives = shortcut.value as Array<SimpleShortcut | ShortcutCombination>
    let out: (JSX.Element | string)[] = []

    if (onlyFirst) {
      const item = alternatives[0]
      if (item.type === 'combination') {
        out = [...out, ...this.renderCombination(item)]
      } else {
        out.push(this.renderShortcut(item))
      }
    } else {
      for (let i = 0; i < alternatives.length; i++) {
        const item = alternatives[i]
        if (item.type === 'combination') {
          out = [...out, ...this.renderCombination(item)]
        } else {
          out.push(this.renderShortcut(item))
        }

        if (i === 0) {
          out.push(this.renderOr())
        }
      }
    }

    return out
  }

  renderSimple(shortcut: SimpleShortcut) {
    let out = []

    if (shortcut.hold) {
      out.push(this.renderHold())
    }
    out.push(this.renderShortcut(shortcut))

    return out
  }

  abstract renderShortcut(shortcut: SimpleShortcut): JSX.Element | string
  abstract renderPlus(key: number): JSX.Element | string
  abstract renderOr(): JSX.Element | string
  abstract renderHold(): JSX.Element | string
}
