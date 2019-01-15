import { EditorScene } from 'modules/editor/types'

export function getEditorScene(title: string, mappings: Record<string, string> = {}): EditorScene {
  return {
    display: {
      title
    },
    owner: 'Decentraland',
    contact: {
      name: 'Decentraland',
      email: 'support@decentraland.org'
    },
    scene: {
      // TODO: This should be received as param
      parcels: ['0,0'],
      base: '0,0'
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
