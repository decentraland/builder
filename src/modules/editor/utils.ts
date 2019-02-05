import { EditorScene, Gizmo } from 'modules/editor/types'
import { env } from 'decentraland-commons'
import { Project } from 'modules/project/types'
import { KeyboardShortcut } from 'modules/keyboard/types'
import { setGizmo, togglePreview, toggleSidebar, editorUndo, editorRedo, resetCamera, zoomIn, zoomOut } from './actions'
import { resetItem, duplicateItem, deleteItem } from 'modules/scene/actions'
import { isPreviewing, isSidebarOpen } from './selectors'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { store } from 'modules/common/store'
import { RootState } from 'modules/common/types'
const script = require('raw-loader!../../ecsScene/scene.js')

const CONTENT_SERVER = env.get('REACT_APP_CONTENT_SERVER', () => {
  throw new Error('Missing REACT_APP_CONTENT_SERVER env variable')
})

export function getNewScene(project: Project): EditorScene {
  const mappings = {
    'game.js': `data:application/javascript;base64,${btoa(script)}`
  }

  return {
    baseUrl: CONTENT_SERVER as string,
    display: {
      title: project.title
    },
    owner: 'Decentraland',
    contact: {
      name: 'Decentraland',
      email: 'support@decentraland.org'
    },
    scene: {
      // TODO: This should be received as param
      parcels: project.parcels ? project.parcels.map(({ x, y }) => `${x},${y}`) : ['0,0'],
      base: project.parcels ? `${project.parcels[0].x}, ${project.parcels[0].y}` : '0,0'
    },
    communications: {
      type: 'webrtc',
      signalling: 'https://rendezvous.decentraland.org'
    },
    policy: {
      fly: true,
      voiceEnabled: true,
      blacklist: [],
      teleportPosition: '0,0,0'
    },
    main: 'game.js',
    _mappings: mappings
  }
}

// This function dispatches actions to the store, but uses `store.dispatch` to scape generators
export function getKeyboardShortcuts(): KeyboardShortcut[] {
  return [
    {
      combination: ['w'],
      callback: () => store.dispatch(setGizmo(Gizmo.MOVE))
    },
    {
      combination: ['e'],
      callback: () => store.dispatch(setGizmo(Gizmo.ROTATE))
    },
    {
      combination: ['s'],
      callback: () => store.dispatch(resetItem())
    },
    {
      combination: ['d'],
      callback: () => store.dispatch(duplicateItem())
    },
    {
      combination: ['o'],
      callback: () => store.dispatch(togglePreview(!isPreviewing(store.getState() as RootState)))
    },
    {
      combination: ['p'],
      callback: () => store.dispatch(toggleSidebar(!isSidebarOpen(store.getState() as RootState)))
    },
    {
      combination: ['del', 'backspace'],
      callback: () => store.dispatch(deleteItem())
    },
    {
      combination: ['command+z', 'ctrl+z'],
      callback: () => store.dispatch(editorUndo())
    },
    {
      combination: ['command+shift+z', 'ctrl+shift+z'],
      callback: () => store.dispatch(editorRedo())
    },
    {
      combination: ['?'],
      callback: () => store.dispatch(openModal('ShortcutsModal'))
    },
    {
      combination: ['space'],
      callback: () => store.dispatch(resetCamera())
    },
    {
      combination: ['shift+='],
      callback: () => store.dispatch(zoomIn())
    },
    {
      combination: ['shift+-'],
      callback: () => store.dispatch(zoomOut())
    }
  ]
}
